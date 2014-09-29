/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Device = require('../api/device/device.model');
var DeviceLog = require('../api/devicelog/devicelog.model');
var Client = require('../api/client/client.model');
var User = require('../api/user/user.model');

Device.find({}, function(err, devices){

  devices.forEach(function(device){

    device.save({isConnected: false, jobid: ''}, function(){});
    
  });
});

Client.find({}).remove(function(){
  
});

DeviceLog.find({}).remove(function(){
  
});


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
      console.log('[seedDB] finished populating users');
    }
  );
});