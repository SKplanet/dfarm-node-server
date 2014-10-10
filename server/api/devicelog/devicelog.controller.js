'use strict';

var _ = require('lodash');
var Devicelog = require('./devicelog.model');
//Devicelog.toObject({ virtuals: true });

// Get list of devicelogs
exports.index = function(req, res) {
  Devicelog.find(function (err, devicelogs) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(devicelogs);
  });
};

// Get a single devicelog
exports.show = function(req, res) {

  Devicelog.find({
    deviceId: req.params.id
  }).limit(20).sort('-date').exec(function (err, devicelogs) {
    if(err) { return handleError(res, err); }
    if(!devicelogs) { return res.status(404).end(); }

    var result = []; 
    devicelogs.forEach(function(log, i, context){
      result.push( log.toObject() );
    });

    return res.status(200).json(result);
  });
};

// Creates a new devicelog in the DB.
exports.create = function(req, res) {
  Devicelog.create(req.body, function(err, devicelog) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(devicelog);
  });
};

// Updates an existing devicelog in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Devicelog.findById(req.params.id, function (err, devicelog) {
    if (err) { return handleError(res, err); }
    if(!devicelog) { return res.status(404).end(); }
    var updated = _.merge(devicelog, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(devicelog);
    });
  });
};

// Deletes a devicelog from the DB.
exports.destroy = function(req, res) {
  Devicelog.findById(req.params.id, function (err, devicelog) {
    if(err) { return handleError(res, err); }
    if(!devicelog) { return res.status(404).end(); }
    devicelog.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).end();
    });
  });
};

function handleError(res, err) {
  return res.status(500).end(err);
}