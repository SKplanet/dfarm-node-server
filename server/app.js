/**
 * Main application file
 */

'use strict';
// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var adbmon = require('./components/adbmon');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io')({
  'browser client gzip': true,
  'browser client etag': true,
  'browser client minification': true,
  'log level': 1,
  'transports':[
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
  ]

}).listen(server);

require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

setTimeout(adbmon.trackDevice, 1000);

//setInterval(adbmon.updateDevice, 10000);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;