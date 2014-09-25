var util = require('util');
//var socket = require('socket.io-client')('http://10.202.34.46:9000');
var socket = require('socket.io-client')('http://10.202.35.214:9000');
var S = require('string');
var isSocketConnected = false;

socket.on('connect', function(){
  console.log('%s session start!', this.io.engine.id);
  isSocketConnected = true;
  socket.on('svc_device', function(data){

    console.log("svc_device", data);

  });

  socket.on('disconnect', function(){
   // socket.removeListener('svc_device');
   console.log("disconnect inside.. so removed listener");
   process.exit();

  });
});

socket.on('reconnect', function(){

  console.log("reconnect");

});

socket.on('connect_error', function(){

  console.log("connect_error");

});

socket.on('connect_timeout', function(){

  console.log("connect_timeout");

});

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (text) {

  //console.log('received data:', S(text).s);
  if(isSocketConnected){

    if (text.match(/^jen_device/)) {

      socket.emit('jen_device', S(text.replace(/jen_device/, "")).trim().s + '{"id":"android-test-sample+%2314", "tag":"SHV-E330S@4.4.2"}');

    }

    if (text.match(/^jen_out/)) {

      socket.emit('jen_out');
      
    }

    socket.emit('state');
  }

  if (text.match(/^quit/)) {
    done();
  }
});

function done() {
  console.log('Now that process.stdin is paused, there is nothing more to do.');
  process.exit();
}