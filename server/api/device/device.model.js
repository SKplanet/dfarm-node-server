'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeviceSchema = new Schema({
  name: String,
  ipaddress: String,
  port: Number,
  serial: {type:String, unique: true},
  active: Boolean
});

module.exports = mongoose.model('Device', DeviceSchema);