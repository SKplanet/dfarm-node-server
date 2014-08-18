/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var thing = require('./thing.model');

exports.register = function(socket) {
  thing.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  thing.schema.post('find', function (doc) {
    console.log("find....");
  });
  thing.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {

  console.log("saved....")
  socket.emit('thing:save', doc);
}

function onRemove(socket, doc, cb) {
  console.log("deleted...");
  socket.emit('thing:remove', doc);
}