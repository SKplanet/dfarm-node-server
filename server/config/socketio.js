/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var Client = require('../api/client/client.model');
var scheduler = require('../components/jenkins-scheduler');
var ip = require('ip');

// When the user disconnects.. perform this
function onDisconnect(socket) {

  Client.findOne({ id : socket.id }, function(err, client){
    if( err) console.log(err);

    if(client){

      console.log("[socketio] client socket-session removed = ", client, socket.id)
      client.remove();  
    }
  });

}

// When the user connects.. perform this
function onConnect(socket) {
  // When the client emits 'info', this listens and executes
  // socket.on('info', function (data) {
  //   console.info('[%s] %s', socket.id, JSON.stringify(data, null, 2));
  // });

  var userAgent = socket.handshake.headers['user-agent'], state='';
  
  if( userAgent.match(/java/i) ){
    socket.connectedTo = 'jenkins-plugin';
    scheduler.register(socket);
    state = 'waiting';
  } 
  else if( userAgent.match(/node/i) ){
    socket.connectedTo = 'node-test-client';
    scheduler.register(socket);
    state = 'waiting';

  } 
  else{
    socket.connectedTo = 'web';
  }

  Client.create({
    id : socket.id,
    jobid: '',
    state: state,
    type : socket.connectedTo,
    ip : socket.request.connection.remoteAddress || ip.address(),
    connectedAt : socket.connectedAt
  }, function(err){
    if(err) console.log('-------------> ', err)
  });

  socket.on('join', function(room) {
    socket.join(room);
  });

  socket.on('leave', function(room) {
    socket.leave(room);
  });
  
}

module.exports = function (socketio) {

  socketio.on('connection', function (socket) {
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

    socket.connectedAt = new Date();

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      console.info('[%s] DISCONNECTED - %s', socket.address, socket.id);

    });

    // Call onConnect.
    onConnect(socket);
    console.info('[%s] CONNECTED - %s', socket.address, socket.id);
  });

  // Insert sockets below
  require('../api/client/client.socket').register(socketio);
  require('../api/device/device.socket').register(socketio);
};