'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClientSchema = new Schema({
  id : {type:String, unique: true},
  jobid: {type:String},
  state: {type:String, default:''},
  type: String,
  ip: String,
  deviceName: String,
  connectedAt: Date
});

module.exports = mongoose.model('Client', ClientSchema);