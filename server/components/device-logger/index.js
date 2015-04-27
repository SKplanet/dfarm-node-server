/**
 * Communicate with Jenkins Plugin
 * 
 * if there is no available device, the client-socket is put into queue by scheduler.
 */
'use strict';

var DeviceLog = require('../../api/devicelog/devicelog.model'),
    Device = require('../../api/device/device.model'),
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
        var duration = moment.duration({'ms': diff});
        var sTime = ""

        if ( duration.minutes() > 0) {
          sTime = duration.minutes() + "min ";
        }

        sTime += duration.seconds() +"sec"

        DeviceLog.create({
          deviceId: device.serial,
          message: ', total used time: ==> ' + sTime,
          state: state
        });

      });
      break;

    case 'kickout':

      Device.findOne({jobid:client.jobid}, function(err, dev){
        DeviceLog.create({
          deviceId: dev.serial,
          message: 'the client for maintenance.',
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
