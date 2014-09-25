'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeviceSchema = new Schema({
  name: String,
  port: Number,
  serial: {type:String, unique: true},
  jobid: {type:String, default: ''},
  isConnected : {type: Boolean, default: false},
  tags: [String], // device name, os version
  photoUrl: String,
  manager: {
    name: {type:String, default:'이름을 지정해주세요.'},
    team: {type:String, default:'팀을 지정해주세요.'}
  }
});

/**
 * Virtuals
 */
DeviceSchema
  .virtual('active')
  .get(function() {
    return !!this.whoused;
  });

/**
 * Methods
 */
DeviceSchema.methods = {
  /**
   * Return available device
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  getAvailableDevice: function() {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};


module.exports = mongoose.model('Device', DeviceSchema);