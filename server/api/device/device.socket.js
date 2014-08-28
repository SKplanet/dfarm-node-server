/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Device = require('./device.model'),
     queue = require('../../config/socket.queue');
var ip = require('ip');

exports.register = function(socket) {
  Device.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Device.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });


  var userAgent = socket.handshake.headers['user-agent'];
  if( userAgent.match(/node|java/i) ){
    registerEvent(socket)
  }
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
      socket.emit("svc_device", { ip:ip.address(), port:device.port, tags: device.tags });
      device.save(function(err){
         if (err) { return console.log('saving error') }
      });

    }else{

      // 일단 큐에 넣는다.
      queue.put(socket);
      queue.state();
    }

  });

} 

function onReleaseDevice(){

  var socket = this;

  console.log('client id: ', socket.id);

  Device.findOne({whoused:socket.id}, function (err, device) {
  
    console.log("whoused:::::::::: ", device, socket.id);

    if(device){
      device.whoused = ''; 
      device.save(function(err){
        if (err) { return console.log('saving error') }
        console.log("=-=-=-=-= device \n", device);
      });
    }

  });
}

function assignDeviceFromQueue(device){
  var socket = queue.get();

  if(socket){
    device.whoused = socket.id;
    socket.emit("svc_device", { ip:ip.address(), port:device.port, tags: device.tags });
    device.save(function(err){
      if (err) { return console.log('saving error') }
    });
  }

  queue.state();
}

function onSave(socket, doc, cb) {
  
  if(doc.whoused === ''){
    assignDeviceFromQueue(doc);
  }
  
  socket.emit('device:save', doc);
}

function onRemove(socket, doc, cb) {
  console.log('device is out', doc)
  socket.emit('device:remove', doc);
}