'use strict';

var mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;

var ClientSchema = new Schema({
  id : {type:String, unique: true},
  jobid: {type:String},
  state: {type:String, default:''},
  type: String,
  ip: String,
  deviceName: String,
  requestTag: String,
  connectedAt: Date
});

/**
 * Virtuals
 */
ClientSchema
  .virtual('dispConnDate')
  .get(function() {
    return moment(this.date).format('YYYY-MM-DD hh:mm:ss');
  });

  
ClientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Client', ClientSchema);