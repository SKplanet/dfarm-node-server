var util = require('util');
var socket = require('socket.io-client')('http://10.202.35.214:9001');
var S = require('string');
var isSocketConnected = false;

socket.on('connect', function(){
  console.log("OK!! Conneect!");
  isSocketConnected = true;
  socket.on('event', function(data){

    console.log("received event data: ", data);

  });
  socket.on('disconnect', function(){});
});


process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (text) {

  console.log('received data:', S(text).s);
  if(isSocketConnected){

    socket.emit('event', S(text).s);

  }

  if (text.match(/^quit/)) {
    done();
  }
});

function done() {
  console.log('Now that process.stdin is paused, there is nothing more to do.');
  process.exit();
}