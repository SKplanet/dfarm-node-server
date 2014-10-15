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

  socket.on('svc_nodevice', function(data){

    console.log("svc_nodevice", data);
   // process.exit();

  });

  socket.on('svc_timeout', function(data){

    console.log("svc_timeout", data);
   // process.exit();

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

      socket.emit('jen_device', S(text.replace(/jen_device/, "")).trim().s + '{"id":"http%3A%2F%2F10.202.34.46%3A8080%2Fjob%2Fandroid-test-sample%28SHV-E330S%29%2F45", "tag":"SHV-E330S"}');

    }

  if (text.match(/^jen_dev2/)) {

      socket.emit('jen_device', S(text.replace(/jen_dev2/, "")).trim().s + '{"id":"http%3A%2F%2F10.202.34.46%3A8080%2Fjob%2Fandroid-test-sample%28SHV-E910S%29%2F46", "tag":"SHV-E330S"}');

    }


    if (text.match(/^jen_dev3/)) {

      socket.emit('jen_device', S(text.replace(/jen_dev3/, "")).trim().s + '{"id":"http%3A%2F%2F10.202.34.46%3A8080%2Fjob%2Fandroid-test-sample%28SHV-E910S%29%2F47", "tag":"SHV-E331S"}');

    }

    if (text.match(/^jen_dev4/)) {

      socket.emit('jen_device', S(text.replace(/jen_dev4/, "")).trim().s + '{"id":"http%3A%2F%2F10.202.34.46%3A8080%2Fjob%2Fandroid-test-sample%28SHV-E910S%29%2F47", "tag":"INVALID"}');

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