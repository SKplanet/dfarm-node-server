'use strict';

var _ = require('lodash');
var Devicelog = require('./devicelog.model');
//Devicelog.toObject({ virtuals: true });

// Get list of devicelogs
exports.index = function(req, res) {
  Devicelog.find(function (err, devicelogs) {
    if(err) { return handleError(res, err); }
    return res.json(200, devicelogs);
  });
};

// Get a single devicelog
exports.show = function(req, res) {

  Devicelog.find({
    deviceId: req.params.id
  }).limit(20).sort('-date').exec(function (err, devicelogs) {
    if(err) { return handleError(res, err); }
    if(!devicelogs) { return res.send(404); }

    var result = []; 
    devicelogs.forEach(function(log, i, context){
      result.push( log.toObject() );
    });

    return res.json(200, result);
  });
};

// Creates a new devicelog in the DB.
exports.create = function(req, res) {
  Devicelog.create(req.body, function(err, devicelog) {
    if(err) { return handleError(res, err); }
    return res.json(201, devicelog);
  });
};

// Updates an existing devicelog in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Devicelog.findById(req.params.id, function (err, devicelog) {
    if (err) { return handleError(res, err); }
    if(!devicelog) { return res.send(404); }
    var updated = _.merge(devicelog, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, devicelog);
    });
  });
};

// Deletes a devicelog from the DB.
exports.destroy = function(req, res) {
  Devicelog.findById(req.params.id, function (err, devicelog) {
    if(err) { return handleError(res, err); }
    if(!devicelog) { return res.send(404); }
    devicelog.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}