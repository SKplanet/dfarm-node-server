/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Device = require('./device.model');

exports.register = function(socket) {
  Device.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Device.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('device:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('device:remove', doc);
}