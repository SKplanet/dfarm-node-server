'use strict';

var adb = require('adbkit');
var client = adb.createClient();
var Device = require('../../api/device/device.model');
var basePort = 6668;

function startTcpUsbBridge(serial) {

  var assignedPort = basePort++
  setTimeout(function () {

    client.getProperties(serial)
      .then(function (data) {

        var deviceName = data['ro.product.model'];
        var osVersion = data['ro.build.version.release'];
        var networkType = data['gsm.network.type'];
        var tags = [deviceName, osVersion];

        if( networkType ){
          tags.push(networkType);
        }

        Device.create({
          name : deviceName,
          port : assignedPort,
          serial : serial,
          tags : tags,
        }, function(err, doc){
          if(err){
            console.log("[adbmon] ", err.err);
          }else{
            console.log("[adbmon] added device to DB");  
          }
          
        });

      });
  }, 1000);
}

module.exports = function startTrackingDevice(){
  client.trackDevices()
    .then(function (tracker) {

      tracker.on('add', function (device) {
        var serial = device.id;
        startTcpUsbBridge(serial);
        console.log('[adbmon] Device %s was plugged in', serial)
      });

      tracker.on('remove', function (device) {
        console.log('[adbmon] Device %s was unplugged', device.id);

        Device.find({serial:device.id}, function(error, data) {

          data.forEach(function(d){
            d.remove();
          });
        });
      });

      tracker.on('end', function () {
        console.info("[adbmon] restart Tracking device... after 10sec");
        setTimeout(function(){

          startTrackingDevice(this);

        }.bind(this), 10000);
        console.log('[adbmon] Tracking stopped')
      });

    })
    .catch(function (err) {
      console.error('[adbmon] Something went wrong:', err.stack)
    });
};
