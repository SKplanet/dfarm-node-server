/**
 * Communicate with Jenkins Plugin
 * 
 * if there is no available device, the client-socket is put into queue by scheduler.
 */
'use strict';

var DeviceLog = require('../../api/devicelog/devicelog.model'),
    moment = require('moment');

exports.recordStart = function(state, device){
  DeviceLog.create({
    deviceId: device.id,
    state: state
  });
};

exports.record = function(state, device, client){

  switch(state){
    case 'tag':
      DeviceLog.create({
        deviceId: device.serial,
        state: '',
        message: 'request ==> ' + client.requestTag
      });
      break;

    case 'assigned':
      DeviceLog.create({
        deviceId: device.serial,
        message: client.jobid,
        state: state
      });
      break;

    case 'released':

      DeviceLog.findOne({deviceId:device.serial, state:'assigned'})
      .sort('-date')
      .exec(function(err, log){
        var diff = moment().diff(log.date);

        DeviceLog.create({
          deviceId: device.serial,
          message: ' time spend ==> ' + diff / 1000 + 's',
          state: state
        });

      });
      break;

  }
};

exports.recordEnd = function(state, device){
  DeviceLog.create({
    deviceId: device.id,
    state: state
  });
};
