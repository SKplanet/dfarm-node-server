'use strict';

var _ = require('lodash'),
  moment = require('moment');

var Device = require('./device.model');

// Get list of devices
exports.index = function(req, res) {
  Device.find({isConnected: true}, function (err, devices) {
    if(err) { return handleError(res, err); }

    var result = [];

    devices.forEach(function(device, i, context){
      result.push( device.toObject() );
    });

    return res.json(200, result);
  });
};

// Get a single device
exports.show = function(req, res) {
  Device.findById(req.params.id, function (err, device) {
    if(err) { return handleError(res, err); }
    if(!device) { return res.send(404); }
    return res.json(device);
  });
};

// Creates a new device in the DB.
exports.create = function(req, res) {
  Device.create(req.body, function(err, device) {
    if(err) { return handleError(res, err); }
    return res.json(201, device);
  });
};

// Updates an existing device in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Device.findById(req.params.id, function (err, device) {
    if (err) { return handleError(res, err); }
    if(!device) { return res.send(404); }

    var updated = _.merge(device, req.body);
    updated.tags = []; 
    req.body.tags.forEach(function(tag){
      updated.tags.push(tag);
    })

    console.log(updated, req.body.tags)

    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, device);
    });
  });
};

// Deletes a device from the DB.
exports.destroy = function(req, res) {
  Device.findById(req.params.id, function (err, device) {
    if(err) { return handleError(res, err); }
    if(!device) { return res.send(404); }
    device.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}