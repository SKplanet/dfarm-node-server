'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UseageSchema = new Schema({
  jobid: {type:String},
  ip: String,
  deviceName: String,
  startDate: Date,
  endDate: Date,
  message: String
});


/**
 * Virtuals
 */
UseageSchema
  .virtual('duration')
  .get(function() {
    var curDate = this.endDate || new Date();
    return curDate - this.startDate;
  });

module.exports = mongoose.model('Useage', UseageSchema);