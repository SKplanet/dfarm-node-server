/**
 * Communicate with Jenkins Plugin
 * 
 * if there is no available device, the client-socket is put into queue by scheduler.
 */
'use strict';

var Device = require('../../api/device/device.model');
var watingSocketQueue = [];
var adb = require('adbkit');
var ip = require('ip');
var client = adb.createClient();
var TcpUsbBridges = [];


function onSearchDevice(data) {

  var query = {whoused:''};
  var socket = this;

  if( data && data.tag ){
    query.tags = {$elemMatch: {$in: data.tag.split(",")} };  
  } 

  Device.findOne(query, function (err, device) {
 
    if(device){
      device.whoused = socket.id;
      device.ip = socket.request.connection.remoteAddress || ip.address();

      assignDevicePort(socket.id, device.serial, device.port);
      socket.emit("svc_device", { ip:ip.address(), port:device.port, tags: device.tags });
      device.save(function(err){
         if (err) { return console.log('saving error') }
      });

    }else{

      // there is no avilable device.
      watingSocketQueue.push(socket);
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
      device.ip = '0.0.0.0';

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
  var socket = watingSocketQueue.shift();

  if(socket){
    device.whoused = socket.id;
    device.ip = socket.request.connection.remoteAddress || ip.address();

    assignDevicePort(socket.id, device.serial, device.port);
    socket.emit("svc_device", { ip:ip.address(), port:device.port, tags: device.tags });
    device.save(function(err){
      if (err) { return console.log('saving error') }
    });
  }

  printWatingQueueState();
}

function registerEvent(socket){

  socket.on('jen_device', onSearchDevice.bind(socket));
  socket.on('jen_out', function(){
    onReleaseDevice.call(socket)
  });
  socket.on('disconnect', function(){
    onReleaseDevice.call(socket)
  });
  socket.on('state', printWatingQueueState);
}

function printWatingQueueState(){
  console.log("\n\n==== QUEUE State ====\nclients", watingSocketQueue.length); 
    
  if( watingSocketQueue.length ){

    watingSocketQueue.forEach(function(socket, i){
      console.log('| seq | %d | %s |', i, socket.id)
    });

    console.log("--------------\n\n"); 

  }else{
    
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

    console.log(data);

  }

}