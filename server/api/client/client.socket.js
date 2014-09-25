/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Client = require('./client.model');
var moment = require('moment');
var scheduler = require('../../components/jenkins-scheduler');

exports.register = function(socketio) {
  
  Client.schema.post('save', function (doc) {
    onSave(socketio, doc);
  });

  Client.schema.post('remove', function (doc) {
    onRemove(socketio, doc);
  });
}

// Mongo Hook for WebSocket
function onSave(socketio, doc, cb) {

  if(doc.state === "in use"){
    socketio.to('client').emit('client:remove', doc);

  }else{

    socketio.to('client').emit('client:save', {
      _id: doc._id,
      id : doc.id,
      ip : doc.ip,
      type: doc.type,
      state: doc.state,
      jobid: doc.jobid,
      deviceName: doc.deviceName,
      requestTag: doc.requestTag,
      dispConnDate: doc.dispConnDate
    });
  }
}

function onRemove(socketio, doc, cb) {

  // 스케쥴러에게 관리자가 해당 클라이언트 연결을 끊으라는 명령을 한 경우지!! 
  scheduler.notify('client:remove', doc);


  // 화면에서 제거해라. 
  socketio.to('client').emit('client:remove', doc);
}