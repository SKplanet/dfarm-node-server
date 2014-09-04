/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Client = require('./client.model');

exports.register = function(socketio) {
  
  Client.schema.post('save', function (doc) {
    onSave(socketio, doc);
  });

  Client.schema.post('remove', function (doc) {
    onRemove(socketio, doc);
  });
}

function onSave(socketio, doc, cb) {
  socketio.to('client').emit('client:save', doc);
}

function onRemove(socketio, doc, cb) {
  socketio.to('client').emit('client:remove', doc);
}