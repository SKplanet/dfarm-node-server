'use strict';

module.exports = function (config) {
  console.log(config.ip);

  var adb = require('adbkit')
  var client = adb.createClient()
  var basePort = 6667;
  var Thing = require('./api/thing/thing.model');

  function startTcpUsbBridge(serial) {
    var assignedPort = basePort++
    setTimeout(function () {
      client.getProperties(serial)
        .then(function (data) {
          console.log(data['ro.product.model']);
          console.log(data['gsm.network.type']);
          console.log(assignedPort);

          Thing.create({
            name : data['ro.product.model'],
            port : assignedPort,
            serial : serial,
            info : serial
          }, function() {
            Thing.find({}, function (error, data) {
              console.log(data);
            });
          });
        });
    }, 1000);

    var server = client.createTcpUsbBridge(serial);
    server.listen(assignedPort);
    server.on('listening', function () {
      console.log("server started");
    });
    server.on('connection', function () {
      console.log("client connection");
    });
    server.on('error', function (error) {
      console.log("error " + error);
    });
  }

  client.trackDevices()
    .then(function (tracker) {
      tracker.on('add', function (device) {
        var serial = device.id;
        startTcpUsbBridge(serial);
        console.log('Device %s was plugged in', serial)
      })
      tracker.on('remove', function (device) {
        console.log('Device %s was unplugged', device.id)
          Thing.find({serial:device.id}, function(error, data) {

            data.forEach(function(d){
              d.remove();
            });
            console.log("aaa" , data);
          });


      })
      tracker.on('end', function () {
        console.log('Tracking stopped')
      })
    })
    .catch(function (err) {
      console.error('Something went wrong:', err.stack)
    })
};
