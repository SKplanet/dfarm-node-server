'use strict';

var _ = require('lodash'),
  moment = require('moment');

var Device = require('./device.model');

// Get list of devices
exports.indexAll = function(req, res) {
  Device.find({}, function (err, devices) {
    if(err) { return handleError(res, err); }

    var result = [];

    devices.forEach(function(device, i, context){
      result.push( device.toObject() );
    });

    return res.status(200).json(result);
  });
};

exports.index = function(req, res) {
  Device.find({isConnected: true}, function (err, devices) {
    if(err) { return handleError(res, err); }

    var result = [];

    devices.forEach(function(device, i, context){
      result.push( device.toObject() );
    });

    return res.status(200).json(result);
  });
};

// Get a single device
exports.show = function(req, res) {
  Device.findById(req.params.id, function (err, device) {
    if(err) { return handleError(res, err); }
    if(!device) { return res.status(404).end(); }
    return res.status(200).json(device);
  });
};

// Creates a new device in the DB.
exports.create = function(req, res) {
  Device.create(req.body, function(err, device) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(device);
  });
};

// Updates an existing device in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Device.findById(req.params.id, function (err, device) {
    if (err) { return handleError(res, err); }
    if(!device) { return res.status(404).end(); }

    var updated = _.merge(device, req.body);

    if(req.body.tags){
      updated.tags = []; 
      req.body.tags.forEach(function(tag){
        updated.tags.push(tag);
      })
    }
    
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(device);
    });
  });
};

// Deletes a device from the DB.
exports.destroy = function(req, res) {
  Device.findById(req.params.id, function (err, device) {
    if(err) { return handleError(res, err); }
    if(!device) { return res.status(404).end(); }
    device.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).end();
    });
  });
};

function handleError(res, err) {
  return res.status(500).end(err);
}