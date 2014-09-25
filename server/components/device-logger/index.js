/**
 * Communicate with Jenkins Plugin
 * 
 * if there is no available device, the client-socket is put into queue by scheduler.
 */
'use strict';

var DeviceLog = require('../../api/devicelog/devicelog.model');
var moment = require('moment');
var LOG_DATE_FORMAT = '[[]YYYY-MM-DD hh:mm:ss[]]';

exports.recordStart = function(state, device){
  console.log(moment().format(LOG_DATE_FORMAT), '[devicelog]', state, device);

  DeviceLog.create({
    deviceId: device.serial,
    state: state
  });
};

exports.record = function(state, device, client){

  console.log(moment().format(LOG_DATE_FORMAT), '[devicelog]', state, device.serial, client.jobid);

  if(state==='released'){
    DeviceLog.create({
      deviceId: device.serial,
      jenkinsJobUrl: device.jobid,
      state: state
    });

  }else{
    DeviceLog.create({
      deviceId: device.serial,
      jenkinsJobUrl: client.jobid,
      state: state
    });
  }
};

exports.recordEnd = function(state, device){

  console.log(moment().format(LOG_DATE_FORMAT), '[devicelog]', state, device);
  
  DeviceLog.create({
    deviceId: device.serial,
    state: state
  });
};
