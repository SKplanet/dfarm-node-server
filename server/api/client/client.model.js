'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClientSchema = new Schema({
  id : {type:String, unique: true},
  type: String,
  from: String,
  connectedAt: Date
});

module.exports = mongoose.model('Client', ClientSchema);