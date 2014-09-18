/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Useage = require('./useage.model');

exports.register = function(socket) {
  Useage.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Useage.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('useage:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('useage:remove', doc);
}