'use strict';

module.exports = function (config) {

  var adb = require('adbkit');
  var client = adb.createClient();
  var basePort = 6667;
  var Device = require('../../api/device/device.model');

  function startTcpUsbBridge(serial) {

    var assignedPort = basePort++
    setTimeout(function () {

      client.getProperties(serial)
        .then(function (data) {

          var deviceName = data['ro.product.model'];
          var osVersion = data['ro.build.version.release'];
          var networkType = data['gsm.network.type'];

          Device.create({
            name : deviceName,
            port : assignedPort,
            serial : serial,
            tags : [deviceName, osVersion, networkType]
          });

        });
    }, 1000);

    var server = client.createTcpUsbBridge(serial);
    server.listen(assignedPort);
    server.on('listening', function () {
      console.log("[adbmon] Tcp Usb Bridge server started");
    });
    server.on('connection', function () {
      console.log("[adbmon] client connection");
    });
    server.on('error', function (error) {
      console.log("[adbmon] error " + error);
    });
  }

  client.trackDevices()
    .then(function (tracker) {
      tracker.on('add', function (device) {
        var serial = device.id;
        startTcpUsbBridge(serial);
        console.log('[adbmon] Device %s was plugged in', serial)
      })
      tracker.on('remove', function (device) {
        console.log('[adbmon] Device %s was unplugged', device.id)
          Device.find({serial:device.id}, function(error, data) {

            data.forEach(function(d){
              d.remove();
            });
            //console.log("[adbmon] " , data);
          });


      })
      tracker.on('end', function () {
        console.log('[adbmon] Tracking stopped')
      })
    })
    .catch(function (err) {
      console.error('[adbmon] Something went wrong:', err.stack)
    })
};
