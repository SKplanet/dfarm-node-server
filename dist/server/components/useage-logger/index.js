/**
 * Communicate with Jenkins Plugin
 * 
 * if there is no available device, the client-socket is put into queue by scheduler.
 */
'use strict';

var Device = require('../../api/device/device.model');
var Client = require('../../api/client/client.model');
var Useage = require('../../api/useage/useage.model');


exports.record = function(device, client){
  console.log('[useage]', device, client);
};