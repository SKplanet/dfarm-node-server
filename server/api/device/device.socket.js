/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Device = require('./device.model'),
     queue = require('../../config/socket.queue');

var adb = require('adbkit');
var ip = require('ip');
var client = adb.createClient();
var TcpUsbBridges = [];

exports.register = function(socketio) {
  Device.schema.post('save', function (doc) {
    onSave(socketio, doc);
  });
  Device.schema.post('remove', function (doc) {
    console.log("[device.socket] removed device info from DB");
    onRemove(socketio, doc);
  });

  // var userAgent = socket.handshake.headers['user-agent'];
  // if( userAgent.match(/node|java/i) ){
  //   registerEvent(socket)
  // }
}

exports.unregister = function(socket){
  // TODO: https://trello.com/c/KoItCuSE/29--
}

function registerEvent(socket){

  socket.on('jen_device', onSearchDevice.bind(socket));
  socket.on('jen_out', function(){
    onReleaseDevice.call(socket)
  });
  socket.on('disconnect', function(){
    onReleaseDevice.call(socket)
  });
  socket.on('state', function(){
    queue.state();
  });

}

function onSearchDevice(data) {

  var query = {whoused:''};
  var socket = this;

  if( data && data.tag ){
    query.tags = {$elemMatch: {$in: data.tag.split(",")} };  
  } 

  Device.findOne(query, function (err, device) {
 
    if(device){
      device.whoused = socket.id;
      assignDevicePort(socket.id, device.serial, device.port);
      socket.emit("svc_device", { ip:ip.address(), port:device.port, tags: device.tags });
      device.save(function(err){
         if (err) { return console.log('saving error') }
      });

    }else{

      // 일단 큐에 넣는다.
      queue.put(socket);
    }

  });

} 

function onReleaseDevice(){

  var socket = this;

  if( TcpUsbBridges[socket.id] ) {
    TcpUsbBridges[socket.id].close();
    TcpUsbBridges[socket.id] = null;
  }

  Device.findOne({whoused:socket.id}, function (err, device) {
  
    if(device){
      device.whoused = ''; 
      device.save(function(err){
        if (err) { return console.log('saving error') }
      });
    }

  });
}

function assignDevicePort(socketid, serial, port){

  var server = client.createTcpUsbBridge(serial);
  server.listen(port);
  server.on('listening', function () {
    console.log("[adbmon] Tcp Usb Bridge server started");
  });
  server.on('connection', function () {
    console.log("[adbmon] client connection");
  });
  server.on('error', function (error) {
    console.log("[adbmon] error " + error);
  });
  server.on('close', function () {
    console.log("[adbmon] closed ");
  });

  if( TcpUsbBridges[socketid] == null ){
    TcpUsbBridges[socketid] = server;
  }else{
    console.log("[ERR] TcpUsbBridge is duplicated!!")
  }
}

function assignDeviceFromQueue(device){
  var socket = queue.get();

  if(socket){
    device.whoused = socket.id;

    assignDevicePort(socket.id, device.serial, device.port);
    socket.emit("svc_device", { ip:ip.address(), port:device.port, tags: device.tags });
    device.save(function(err){
      if (err) { return console.log('saving error') }
    });
  }

  queue.state();
}

function onSave(socketio, doc, cb) {
  
  if(doc.whoused === ''){
    assignDeviceFromQueue(doc);
  }
  
  socketio.to('device').emit('device:save', doc);
}

function onRemove(socketio, doc, cb) {
  socketio.to('device').emit('device:remove', doc);
}