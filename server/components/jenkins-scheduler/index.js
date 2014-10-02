/**
 * Communicate with Jenkins Plugin
 * 
 * if there is no available device, the client-socket is put into queue by scheduler.
 */
'use strict';

var Device = require('../../api/device/device.model');
var Client = require('../../api/client/client.model');
var deviceLogger = require('../../components/device-logger');
var queryMaker = require('./queryMaker');
var waitingSocketQueue = [];
var WorkingSockets = [];
var adb = require('adbkit');
var ip = require('ip');
var client = adb.createClient();
var TcpUsbBridges = [];
var _ = require('lodash');
var dlog = require('../../components/debug-logger');

function registerEvent(socket){

  socket.on('jen_device', function(data){
    data = JSON.parse(data||'{}');
    onJenDevice.call(null, socket, data);
  });
  socket.on('jen_out', function(){
    onReleaseDevice.call(null, socket, 'jen_out');
  });
  socket.on('disconnect', function(){
    onReleaseDevice.call(null, socket, 'disconnect');
  });
  socket.on('state', printWatingQueueState);
}


/**
 * 클라이언트로부터 jen_device 요청을 받으면, 
 * 
 * 1. 연결된 디바이스 목록에서 사용가능한 디바이스를 검색한다.
 * 2. 해당 디바이스에 클라이언트 정보를 기록한다.
 * 3. 해당 디바이스와 클라이언트를 연결하는 포트를 열어준다.  
 * 
 */ 
function onJenDevice(socket, data) {

  var query = {jobid:'', isConnected:true};
  if( !queryMaker.generate(query, data) ){
    socket.disconnect();
    return;
  }

  // 1. 일단 jobid를 client에 설정하고,..
  socket.requestTag = data.tag;
  Client.findOneAndUpdate({id: socket.id}, {jobid:data.id, state:'waiting'}, function(err, client){

    if (err){ console.log(err); }

    if(client){
      // 1-1. 클라이언트에 태그 정보를 기록 한다.
      client.requestTag= data.tag;
      client.save();  
    }

    // 2. 혹시나 중복 요청은 아닌지 검사한다.
    Device.findOne({jobid: data.id}, function (err, device) {
      if(device){

        console.log("[jenkins-scheduler][warning] duplicated command!");

      }else{

        // 3. 중복 요청이 아니므로 할당을 시도한다.
        Device.findOne(query, function (err, device) {

          if(device){
  
            assignDevice(device, socket);

          }else{

            var index = _.indexOf(waitingSocketQueue, socket);
            if(index < 0){
              waitingSocketQueue.push(socket);
            }
          }

        });
      }

    });

  });
} 



/**
 * WaitingSocketQueue를 뒤져서 할당할수있는 녀석을 찾아본다.
 */
function assignDeviceFromQueue(device){

  var socket = waitingSocketQueue.shift();

  if (socket) {

    assignDevice(device, socket);

  }

  // var socket,i,len = waitingSocketQueue.length, index;

  // for(i=0; i<len; ++i){

  //   socket = waitingSocketQueue[i];

  //   index = _.findIndex(device.tags, function(tag){ 
  //     return socket.requestTag === tag; 
  //   });

  //   if( index > -1 ){
    
  //     assignDevice(device, socket);
  //     waitingSocketQueue.splice(i,1);
  //     break;      
    
  //   }
  // }

  printWatingQueueState();
}

function assignDevice(device, socket){

  assignDevicePort(socket.id, device.serial, device.port, function(success){

    if(!success){ return; }

    Client.findOne({id: socket.id}, function(err, client){

      if(!client){ return; }

      device.jobid = client.jobid;
      socket.emit("svc_device", { 
        ip: ip.address(), 
        url: "http://"+ ip.address() + ":9000/devices/" + device._id,
        port:device.port, 
        tags: device.tags 
      });
      device.save(function(err){
         if (err) { return console.log('device saving error') }
      });

      client.deviceName = device.name;
      client.state = 'processing';
      client.save(function(err){
        if (err) { return console.log('client saving error') } 
      });

      // 디바이스 사용로그에 시작 시간을 기록한다.
      deviceLogger.record('finding device', device, client.requestTag);
      setTimeout(function(){
        deviceLogger.record('assigned', device, client);  
      }, 10);
      

      // 워킹소켓에도 한번만 들어간다.
      var index = _.indexOf(waitingSocketQueue, socket);
      if(index < 0){
        WorkingSockets.push(socket);
      }

      console.log("[jenkins-scheduler] %d clients in used", WorkingSockets.length);

    });
  });
}

function onReleaseDevice(socket, message){
  var serial = 0;

  if( TcpUsbBridges[socket.id] ) {

    serial = TcpUsbBridges[socket.id].serial;
    TcpUsbBridges[socket.id].close();
    TcpUsbBridges[socket.id] = null;
  }

  Client.findOne({id:socket.id}, function(err, client){

    if(err) { return console.log(err) }

    Device.findOne({serial:serial}, function (err, device) {
      if(err) { return console.log(err) }
      if(!device) { return; }

      console.log('[TcpUsbBridges] was closed:', device.port);

      deviceLogger.record('released', device, client);
  
      device.jobid = ''; 
      device.save(function(err){
        if (err) { return console.log('saving error') }
      });


      if(message === 'jen_out'){
        client.deviceName = '';
        client.jobid = '';
        client.state = 'done';
        client.save(function(err){
          if (err) { return console.log('client saving error') } 
        });
      }

      // 워킹 소켓에서 제거한다.
      var index = _.indexOf(WorkingSockets, socket);
      if(index > -1){
        WorkingSockets.splice(index, 1);  
      }
    });

  });

 
}

function assignDevicePort(socketid, serial, port, callback){

  var server = client.createTcpUsbBridge(serial);

  server.listen(port);
  server.on('listening', function () {

    dlog.log('TcpUsbBridge','server started and listening tcp port: %d', port);
    console.log('[adbmon] TcpUsbBridge server started and listening tcp port: %d', port);

    if( TcpUsbBridges[socketid] == null ){
      
      TcpUsbBridges[socketid] = server;

      callback && callback(true);

    }else{

      callback && callback(false);
      console.log("[ERR] TcpUsbBridge is duplicated!!")
    }

    

  });
  server.on('error', function (error) {
    console.log("[adbmon] error " + error);
    callback && callback(false);
  });
  server.on('connection', function () {
    console.log("[adbmon] client connection");
  });
  server.on('close', function () {
    console.log("[adbmon] closed ");
  });

}

function printWatingQueueState(){

  if( waitingSocketQueue.length > 0 ){
    console.log("\n\n[WatingQUEUE State] - %d clients waiting", waitingSocketQueue.length); 
    waitingSocketQueue.forEach(function(socket, i){
      console.log('| seq | %d | %s ', i, socket.id, socket.requestTag);
    });
    console.log("--------------\n\n"); 
  }
}

exports.remove = function(socket){

  for(var i=0; i<WorkingSockets.length; ++i){
    if(WorkingSockets[i].id === socket.id){
      WorkingSockets[i].disconnect();
      WorkingSockets.splice(i,1);
    }
  }

  for(i=0; i<waitingSocketQueue.length; ++i){
    if(waitingSocketQueue[i].id === socket.id){
      waitingSocketQueue[i].disconnect();
      waitingSocketQueue.splice(i,1);
    }
  }
};


exports.register = function(socket) {

  registerEvent(socket)
};

/**
 * @message from: api/device/device.socket
 */
exports.notify = function(message, data){

  if(message === 'state:changed') {

    if ( data.jobid === '' ){

      assignDeviceFromQueue(data);
    }

  }

  if(message === 'client:remove') {

    for(var i=0; i<WorkingSockets.length; ++i){
      if(WorkingSockets[i].id === data.id){
        WorkingSockets[i].disconnect();
        WorkingSockets.splice(i,1);
      }
    }
  }
}