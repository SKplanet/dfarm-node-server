'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    moment = require('moment'),
    LOG_DATE_FORMAT = '[[]YYYY-MM-DD hh:mm:ss[]]';

var DevicelogSchema = new Schema({
  date: { type: Date, default: Date.now },
  deviceId: String,
  jenkinsJobUrl: String,
  state: String
});
DevicelogSchema.set('autoIndex', false);

/**
 * Virtuals
 */
DevicelogSchema
  .virtual('dispDate')
  .get(function() {
    return moment(this.date).format(LOG_DATE_FORMAT);
  });

DevicelogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Devicelog', DevicelogSchema);