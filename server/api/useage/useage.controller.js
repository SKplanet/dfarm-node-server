'use strict';

var _ = require('lodash');
var Useage = require('./useage.model');

// Get list of useages
exports.index = function(req, res) {
  Useage.find(function (err, useages) {
    if(err) { return handleError(res, err); }
    return res.json(200, useages);
  });
};

// Get a single useage
exports.show = function(req, res) {
  Useage.findById(req.params.id, function (err, useage) {
    if(err) { return handleError(res, err); }
    if(!useage) { return res.send(404); }
    return res.json(useage);
  });
};

// Creates a new useage in the DB.
exports.create = function(req, res) {
  Useage.create(req.body, function(err, useage) {
    if(err) { return handleError(res, err); }
    return res.json(201, useage);
  });
};

// Updates an existing useage in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Useage.findById(req.params.id, function (err, useage) {
    if (err) { return handleError(res, err); }
    if(!useage) { return res.send(404); }
    var updated = _.merge(useage, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, useage);
    });
  });
};

// Deletes a useage from the DB.
exports.destroy = function(req, res) {
  Useage.findById(req.params.id, function (err, useage) {
    if(err) { return handleError(res, err); }
    if(!useage) { return res.send(404); }
    useage.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}