/**
 * Communicate with Jenkins Plugin
 * 
 * if there is no available device, the client-socket is put into queue by scheduler.
 */
'use strict';

var Device = require('../../api/device/device.model');
var Client = require('../../api/client/client.model');
var deviceLogger = require('../../components/device-logger');
var debug = require('../../components/debug-logger');
var queryMaker = require('./queryMaker');
var waitingSocketQueue = [];
var WorkingSockets = [];
var adb = require('adbkit');
var ip = require('ip');
var client = adb.createClient();
var TcpUsbBridges = [];
var _ = require('lodash');

function registerEvent(socket){

  socket.on('jen_device', function(data){
    debug.log('<==== JEN_DEVICE', '');
    data = JSON.parse(data||'{}');
    onJenDevice.call(null, socket, data);
  });
  socket.on('jen_out', function(){
    debug.log('<==== JEN_OUT', '');
    onReleaseDevice.call(null, socket.id, 'jen_out');
  });
  socket.on('disconnect', function(){
    debug.log('<==== DISCONNECT', '');
    onReleaseDevice.call(null, socket.id, 'disconnect');
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

  var query = {};
  if( !queryMaker.generate(query, data) ){
    socket.disconnect();
    return;
  }

  // 1. 일단 jobid를 client에 설정하고,..
  socket.requestTag = data.tag;
  Client.findOneAndUpdate({id: socket.id}, {jobid:data.id, state:'waiting'}, function(err, client){

    if (err){ debug.log(err); }

    if(client){
      // 1-1. 클라이언트에 태그 정보를 기록 한다.
      client.requestTag= data.tag;
      client.save();  
    }

    // 2. 혹시나 중복 요청은 아닌지 검사한다.
    Device.findOne({jobid: data.id}, function (err, device) {
      if(device){

        debug.log('[jenkins-scheduler]','[warning] duplicated command!');

      }else{


        // 3. 중복 요청이 아니므로 할당을 시도한다.
        Device.find(query, function (err, devices) {

          if(devices.length){

            var device = _.find(devices, {jobid:'', isConnected:true});

            if(device){
              
              assignDevice(device, socket);  

            }else{

              var index = _.indexOf(waitingSocketQueue, socket);
              if(index < 0){
                waitingSocketQueue.push(socket);
              }
            }

          }else{

            socket.emit("svc_nodevice", { 
              tags: data.tag
            });
            socket.disconnect();
            debug.log('====> SVC_NODEVICE', '');
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

  var socket,i,len = waitingSocketQueue.length, index;

  for(i=0; i<len; ++i){

    socket = waitingSocketQueue[i];

    index = _.findIndex(device.tags, function(tag){ 
      return socket.requestTag === tag; 
    });

    if( index > -1 ){
    
      assignDevice(device, socket);
      waitingSocketQueue.splice(i,1);
      break;      
    
    }
  }

  printWatingQueueState();
}


var TimeoutManager = {}
function addTimeout (socketid){

  TimeoutManager[socketid] = setTimeout(function(){

    debug.log('[jenkins-scheduler]', 'Timeout 10 mins... ' + socketid);

    clearTimeout(TimeoutManager[socketid]);
    TimeoutManager[socketid] = null;
    onReleaseDevice(socketid, 'timeout');

  }, 10 * 60 * 1000);

}

function assignDevice(device, socket){

  assignDevicePort(socket.id, device.serial, device.port, function(success){

    if(!success){ return; }

    Client.findOne({id: socket.id}, function(err, client){

      if(!client){ return; }

      device.jobid = client.jobid;
      device.connectedAt = new Date();
      socket.emit("svc_device", { 
        ip: ip.address(), 
        url: "http://"+ ip.address() + ":9000/devices/" + device._id,
        port:device.port, 
        tags: device.tags 
      });
      debug.log('====> SVC_DEVICE', '');
      device.save(function(err){
         if (err) { return debug.log('[jenkins-scheduler]','device saving error') }
      });

      // 타이머가 추가
      addTimeout(socket.id);

      client.deviceName = device.name;
      client.state = 'processing';
      client.save(function(err){
        if (err) { return debug.log('[jenkins-scheduler]','client saving error') } 
      });

      // 디바이스 사용로그에 시작 시간을 기록한다.
      deviceLogger.record('tag', device, client);
      setTimeout(function(){
        deviceLogger.record('assigned', device, client);  
      }, 10);
      

      // 워킹소켓에도 한번만 들어간다.
      var index = _.indexOf(waitingSocketQueue, socket);
      if(index < 0){
        WorkingSockets.push(socket);
      }

      debug.log('[jenkins-scheduler]', WorkingSockets.length + ' clients in used');

    });
  });
}

function onReleaseDevice(socketid, message){
  var serial = removeFromTcpUsbBridges(socketid);

  Client.findOne({id:socketid}, function(err, client){

    if(err) { return debug.log(err) }

    Device.findOne({serial:serial}, function (err, device) {
      if(err) { return debug.log(err) }
      if(!device) { return; }

      debug.log('[TcpUsbBridges]','was closed, port: '+ device.port);

      deviceLogger.record('released', device, client);
  
      device.jobid = ''; 
      device.connectedAt = null;
      device.save(function(err){
        if (err) { return debug.log('[TcpUsbBridges]','saving error') }
      });


      if(message === 'jen_out'){
        client.deviceName = '';
        client.jobid = '';
        client.state = 'done';
        client.save(function(err){
          if (err) { return debug.log('[TcpUsbBridges]','client saving error') } 
        });
      }

      // 워킹 소켓에서 제거한다.
      removeFromWorkingSockets(socketid, message);
    });

  });
}

function assignDevicePort(socketid, serial, port, callback){

  var server = client.createTcpUsbBridge(serial);

  server.listen(port);
  server.on('listening', function () {

    debug.log('[TcpUsbBridges]','server started and listening tcp port: '+ port);

    if( TcpUsbBridges[socketid] == null ){
      
      TcpUsbBridges[socketid] = server;

      callback && callback(true);

    }else{

      callback && callback(false);
      debug.error('[TcpUsbBridges]','TcpUsbBridge is duplicated!!');
    }
  });


  server.on('error', function (error) {
    debug.error('[adbmon]', error);
    callback && callback(false);
  });
  server.on('connection', function () {
    debug.log('[adbmon]','client connection');
  });
  server.on('close', function () {
    debug.log('[adbmon]','closed');
  });

}

function printWatingQueueState(){

  if( waitingSocketQueue.length > 0 ){
    console.log("[WatingQUEUE State] - %d clients waiting", waitingSocketQueue.length); 
    waitingSocketQueue.forEach(function(socket, i){
      console.log('| seq | %d | %s ', i, socket.id, socket.requestTag);
    });
    console.log("--------------\n"); 
  }
}

function removeFromTcpUsbBridges(socketid){

  var serial = 0;
  if( TcpUsbBridges[socketid] ) {
    serial = TcpUsbBridges[socketid].serial;
    TcpUsbBridges[socketid].close();
    TcpUsbBridges[socketid] = null;
    debug.log('[TcpUsbBridges]', serial + ' device\'s TcpUsbBridge is disconnected');
  }
  return serial;
}

function removeFromWorkingSockets(socketid, isTimeout){
  for(var i=0; i<WorkingSockets.length; ++i){
    if(WorkingSockets[i].id === socketid){

      if(isTimeout){
        WorkingSockets[i].emit('svc_timeout', "10 minutes timeout, you can't occupy a device more than 10 minutes");  
      }
      WorkingSockets[i].disconnect();
      WorkingSockets.splice(i,1);
      debug.log('[jenkins-scheduler]', socketid + ' socket is spliced from Working Sockets');
      return 1;
    }
  }
  return 0;
}

function removeFromWaitingSockets(socketid){
  for(var i=0; i<waitingSocketQueue.length; ++i){
    if(waitingSocketQueue[i].id === socketid){
      waitingSocketQueue[i].disconnect();
      waitingSocketQueue.splice(i,1);
      debug.log('[jenkins-scheduler]', socketid + ' socket is spliced from Waiting Sockets');
      return 1;
    }
  }
  return 0;
}

exports.remove = function(socket){

  var socketid = socket.id;

  removeFromTcpUsbBridges(socketid);
  removeFromWorkingSockets(socketid);
  removeFromWaitingSockets(socketid);
};


exports.register = function(socket) {

  registerEvent(socket)
};

/**
 * @message from: api/device/device.socket & api/client/client.socket
 */
exports.notify = function(message, data){

  if(message === 'state:changed') {

    if ( data.jobid === '' ){

      assignDeviceFromQueue(data);
    }

    if ( data.isConnected === false ){

      debug.log('[adb]', 'device is disconnected..');

      Client.findOne({jobid: data.jobid}, function(err, client){

        if(!client){ return; }

        var socketid = client.id;
        removeFromTcpUsbBridges(socketid);
        removeFromWorkingSockets(socketid);
        removeFromWaitingSockets(socketid);

        Device.findOne({jobid: data.jobid}, function(err, device){
          if(!device){ return; }
          device.jobid = '';
          device.connectedAt = null;
          device.save();
        })

      });
    }
  }

  if(message === 'client:remove') {

    if( removeFromWaitingSockets(data.id) ) {
      debug.log('[client]', 'kickout');
    }

  }
}