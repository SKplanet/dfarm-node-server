/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Device = require('../api/device/device.model');
var DeviceLog = require('../api/devicelog/devicelog.model');
var Client = require('../api/client/client.model');
var User = require('../api/user/user.model');
var debug = require('../components/debug-logger');

Device.find({}, function(err, devices){

  devices.forEach(function(device){
    device.isConnected = false;
    device.jobid = '';
    device.save(function(){});
  });

  debug.log('[seedDB]','finished populating devices');
});

Client.find({}).remove(function(){
  debug.log('[seedDB]','finished populating clients');
});

// DeviceLog.find({}).remove(function(){
//   console.log('[seedDB] finished populating device logs');
// });


User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function() {
      debug.log('[seedDB]', 'finished populating users');
    }
  );
});