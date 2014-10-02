/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Devicelog = require('./devicelog.model');

exports.register = function(socketio) {
  Devicelog.schema.post('save', function (doc) {
    onSave(socketio, doc);
  });
  Devicelog.schema.post('remove', function (doc) {
    onRemove(socketio, doc);
  });
}

function onSave(socketio, doc, cb) {

  socketio.to('devicelog').emit('devicelog:save', {
    _id: doc._id,
    id: doc.id,
    deviceId: doc.deviceId,
    jenkinsJobUrl: doc.jenkinsJobUrl,
    state: doc.state,
    dispDate: doc.dispDate,
    message: doc.message,
    date: doc.date
  });
}

function onRemove(socketio, doc, cb) {
  socketio.to('devicelog').emit('devicelog:remove', doc);
}