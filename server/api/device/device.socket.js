/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Device = require('./device.model');
var scheduler = require('../../components/jenkins-scheduler');

exports.register = function(socketio) {
  Device.schema.post('save', function (doc) {
    onSave(socketio, doc);
  });
  Device.schema.post('remove', function (doc) {
    console.log("[device.socket] removed device info from DB");
    onRemove(socketio, doc);
  });
}

function onSave(socketio, doc, cb) {
  scheduler.notify('state:changed', doc);
  socketio.to('device').emit('device:save', doc);
}

function onRemove(socketio, doc, cb) {
  socketio.to('device').emit('device:remove', doc);
}