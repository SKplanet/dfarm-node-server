'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeviceSchema = new Schema({
  name: String,
  port: Number,
  serial: {type:String, unique: true},
  jobid: {type:String, default: ''},
  isConnected : {type: Boolean, default: false},
  tags: [String],
  photoUrl: String,
  manager: {
    name: {type:String, default:'이름을 지정해주세요.'},
    team: {type:String, default:'팀을 지정해주세요.'}
  }
});

module.exports = mongoose.model('Device', DeviceSchema);