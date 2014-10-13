var winston = require('winston');
var moment = require('moment');

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        timestamp: function(){
          return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
        }
      })
    ]
});

var moduleOptions = {
  'TcpUsbBridge' : {
    level : 1,
    color : 'red'
  }
};

exports.log = function log (name, message) {
  logger.info(name, message);
}

exports.error = function log (name, message) {
  logger.error('error', name, message);
}