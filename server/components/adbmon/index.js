'use strict';

var adb = require('adbkit');
var client = adb.createClient();
var Device = require('../../api/device/device.model');
var deviceLogger = require('../../components/device-logger');
var Q = require('q');

function assignPort(){

  return Q.promise(function(resolve, reject, notify){

    var ports = [];
    var basePort = 6668;

    Device.find({}, function(err, devices){

      if(err){ return console.log(err); }

      devices.forEach(function(device){
        ports.push(device.port);
      });

      // 포트를 정렬하고,...
      ports.sort();

      ports.forEach(function(port){

        if(basePort === port){
          basePort++;
        }else{

          resolve(port);
        }
      });
      resolve(basePort);
    });

  });

}

function startTcpUsbBridge(serial) {

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
            device.jobid = "";
            device.isConnected = true;
            device.save();

            console.log("[adbmon] %s device was initialized", device.serial);  

          }else{

            assignPort()
            .then(function(port){

              Device.create({
                name : deviceName,
                port : port,
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
            })

          }

        });

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
    console.error('[adbmon][unexpected error catch] maybe adb problem.', err);
  })
}

function isIPAddress(str){
  var match = str.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/);

  return !!match;
}

module.exports.updateDevice = function updateDeviceStatus(){

  client.listDevices()
  .then(function(devices) {

    console.log('devices', devices);

    // devices.forEach(function(device){

    //   console.log(device);
    // });

    // return Q.map(devices, function(device) {
    //   return client.readdir(device.id, '/sdcard')
    //     .then(function(files) {
    //       // Synchronous, so we don't have to care about returning at the right time
    //       files.forEach(function(file) {
    //         if (file.isFile()) {
    //           console.log('[%s] Found file "%s"', device.id, file.name)
    //         }
    //       })
    //     })
    // })
  })
  .then(function() {
    console.log('Done checking /sdcard files on connected devices')
  })
  .catch(function(err) {
    console.error('Something went wrong:', err.stack)
  })

};


module.exports.trackDevice = function startTrackingDevice(){
  client.trackDevices()
    .then(function (tracker) {

      tracker.on('add', function (device) {
        var serial = device.id;
        
        if( !isIPAddress(serial) ){
          startTcpUsbBridge(serial);

          deviceLogger.recordStart('connected', device);

          console.log('[adbmon] Device %s was plugged in', serial);
          installSupportingTool(device);
        }else{
          console.log('[adbmon] IP Device %s is skipped! from tracking device add', serial);
        }

      });

      tracker.on('remove', function (device) {
        var serial = device.id;

        if( !isIPAddress(serial) ){
          deviceLogger.recordEnd('disconnected', device);
          console.log('[adbmon] Device %s was unplugged', device.id);

          Device.findOne({serial:device.id}, function(error, d) {
            if(d){
              d.isConnected = false;
              d.save();  
            }
          });
        }else{

          console.log('[adbmon] IP Device %s is skipped! from tracking device remove', serial);
        }
      });

      tracker.on('change', function (device) {
        console.info("[adbmon] %d device is offline...so restart tracking device after 10sec", device);
        setTimeout(startTrackingDevice, 10000);
      });

      tracker.on('end', function (device) {
        console.info("[adbmon] restart Tracking %d device... after 10sec", device);
        setTimeout(startTrackingDevice, 10000);
      });

    })
    .catch(function (err) {
      console.error('[adbmon] Something went wrong:', err.stack)
    });
};
