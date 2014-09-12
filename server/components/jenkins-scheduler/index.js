/**
 * Communicate with Jenkins Plugin
 * 
 * if there is no available device, the client-socket is put into queue by scheduler.
 */
'use strict';

var Device = require('../../api/device/device.model');
var Client = require('../../api/client/client.model');
var watingSocketQueue = [];
var WorkingSockets = [];
var adb = require('adbkit');
var ip = require('ip');
var client = adb.createClient();
var TcpUsbBridges = [];
var _ = require('lodash');

/**
 * 클라이언트로부터 jen_device 요청을 받으면, 
 * 
 * 1. 연결된 디바이스 목록에서 사용가능한 디바이스를 검색한다.
 * 2. 해당 디바이스에 클라이언트 정보를 기록한다.
 * 3. 해당 디바이스와 클라이언트를 연결하는 포트를 열어준다.  
 * 
 */ 
function onJenDevice(data) {

  var query = {whoused:''};
  var socket = this;

  if( data && data.tag ){
    query.tags = {$elemMatch: {$in: data.tag.split(",")} };  
  } 

  Device.findOne(query, function (err, device) {
 
    if(device){
      
      assignDevice(device, socket);

    }else{

      // there is no avilable device.
      var index = _.indexOf(watingSocketQueue, socket);
      if(index < 0){
        watingSocketQueue.push(socket);
      }
    }

  });
} 

function assignDeviceFromQueue(device){
  var socket = watingSocketQueue.shift();

  if(socket){
     
     assignDevice(device, socket);
  }

  printWatingQueueState();
}


function assignDevice(device, socket){
  device.whoused = socket.id;
  device.ip = socket.request.connection.remoteAddress || ip.address();

  assignDevicePort(socket.id, device.serial, device.port, function(success){

    if(success){

      socket.emit("svc_device", { ip:ip.address(), port:device.port, tags: device.tags });
      device.save(function(err){
         if (err) { return console.log('device saving error') }
      });

      Client.findOne({id: socket.id}, function(err, client){

        client.deviceName = device.name;
        client.save(function(err){
          if (err) { return console.log('client saving error') } 
        });

      });

      WorkingSockets.push(socket);

      console.log("WorkingSockets : ", WorkingSockets.length);
    }


  });
}

function onReleaseDevice(){

  var socket = this;

  if( TcpUsbBridges[socket.id] ) {

    console.log('[TcpUsbBridges] close port:', TcpUsbBridges[socket.id].client.options.port);
    TcpUsbBridges[socket.id].close();
    TcpUsbBridges[socket.id] = null;
  }

  Device.findOne({whoused:socket.id}, function (err, device) {
  
    if(device){
      device.whoused = ''; 
      device.ip = '';

      device.save(function(err){
        if (err) { return console.log('saving error') }
      });

      Client.findOne({id: socket.id}, function(err, client){

        if (err) { return console.log('no client find error', err) }

        if(client){
          client.deviceName = '';
          client.save(function(err){
            if (err) { return console.log('client saving error') } 
          });
        }

      });

      // 워킹 소켓에서 제거한다.
      var index = _.indexOf(WorkingSockets, function(wsoc){
        return wsoc.id === socket.id
      });
      if(index){
        WorkingSockets.slice(index, 1);  
      }
      

    }

  });
}

function assignDevicePort(socketid, serial, port, callback){

  var server = client.createTcpUsbBridge(serial);

  console.log("[adbmon] trying open port...", port);
  server.listen(port);
  server.on('listening', function () {
    console.log("[adbmon] Tcp Usb Bridge server started... client-port ", server.client);

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

function registerEvent(socket){

  socket.on('jen_device', onJenDevice.bind(socket));
  socket.on('jen_out', function(){
    onReleaseDevice.call(socket)
  });
  socket.on('disconnect', function(){
    onReleaseDevice.call(socket)
  });
  socket.on('state', printWatingQueueState);
}

function printWatingQueueState(){

  if( watingSocketQueue.length > 0 ){
    console.log("\n\n[WatingQUEUE State] - %d clients wating", watingSocketQueue.length); 
    watingSocketQueue.forEach(function(socket, i){
      console.log('| seq | %d | %s |', i, socket.id)
    });
    console.log("--------------\n\n"); 
  }
}


exports.register = function(socket) {

  registerEvent(socket)
}

/**
 * @message from: api/device/device.socket
 */
exports.notify = function(message, data){

  if(message === 'state:changed') {

    if ( data.whoused === '' ){
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