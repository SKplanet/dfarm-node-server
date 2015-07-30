'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeviceSchema = new Schema({
  name: String,
  port: Number,
  serial: {type:String, unique: true},
  jobid: {type:String, default: ''},
  connectedAt : {type: Date},
  isConnected : {type: Boolean, default: false},
  tags: [String],
  photoUrl: String,
  manager: {
    name: {type:String, default:'이름을 지정해주세요.'},
    team: {type:String, default:'팀을 지정해주세요.'}
  },
  monopoly: {
    isOccupied: false,
    note: ''
  }
}, {'versionKey': false});

module.exports = mongoose.model('Device', DeviceSchema);