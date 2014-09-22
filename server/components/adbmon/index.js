'use strict';

var adb = require('adbkit');
var client = adb.createClient();
var Device = require('../../api/device/device.model');
var Q = require('q');
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

        Device.findOne({serial: serial}, function(err, device){

          if(device){
            device.isConnected = true;
            device.save();

          }else{

            Device.create({
              name : deviceName,
              port : assignedPort,
              serial : serial,
              tags : tags,
              isConnected: true
            }, function(err, doc){
              if(err){
                console.log("[adbmon] ", err.err);
              }else{
                console.log("[adbmon] added device to DB");  
              }
              
            });

          }

        });

        // Device.update({serial: serial},{
        //   name : deviceName,
        //   port : assignedPort,
        //   serial : serial,
        //   tags : tags,
        //   isConnected: true
        // }, {upsert: true}, function(err, doc){
        //   if(err){
        //     console.log("[adbmon] ", err.err);
        //   }else{
        //     console.log("[adbmon] added device to DB");  
        //   }
          
        // });

      });
  }, 1000);
}

function installSupportingTool(device){
  
  var apk = 'download/app-debug.apk';

  Q.fcall(function() {
      return client.install(device.id, apk);
  })
  .then(function() {
    console.log('[adbmon] Installed %s on connected device(%s)', apk, device.id);
  })
  .catch(function(err) {
    console.error('Something went wrong:', err.stack);
  })

}

module.exports = function startTrackingDevice(){
  client.trackDevices()
    .then(function (tracker) {

      tracker.on('add', function (device) {
        var serial = device.id;
        startTcpUsbBridge(serial);
        console.log('[adbmon] Device %s was plugged in', serial);

        installSupportingTool(device);
      });

      tracker.on('remove', function (device) {
        console.log('[adbmon] Device %s was unplugged', device.id);

        Device.findOne({serial:device.id}, function(error, d) {

          d.isConnected = false;
          d.save();

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
