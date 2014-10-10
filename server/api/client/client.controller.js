'use strict';

var _ = require('lodash');
var moment = require('moment');
var Client = require('./client.model');
var Device = require('../device/device.model');

// Get list of clients
exports.index = function(req, res) {
  Client.find({state:'waiting'}).sort('connectedAt').exec(function (err, clients) {
    if(err) { return handleError(res, err); }

    var result = [];

    clients.forEach(function(client, i, context){
      result.push( client.toObject() );
    });

    return res.status(200).json(result);
  });
};

// Get a single client
exports.show = function(req, res) {
  Client.findById(req.params.id, function (err, client) {
    if(err) { return handleError(res, err); }
    if(!client) { return res.status(404).end(); }
    return res.status(200).json(client);
  });
};

// Creates a new client in the DB.
exports.create = function(req, res) {
  Client.create(req.body, function(err, client) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(client);
  });
};

// Updates an existing client in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Client.findById(req.params.id, function (err, client) {
    if (err) { return handleError(res, err); }
    if(!client) { return res.status(404).end(); }
    var updated = _.merge(client, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(client);
    });
  });
};

// Deletes a client from the DB.
exports.destroy = function (req, res) {
  Client.findById(req.params.id, function (err, client) {
    if(err) { return handleError(res, err); }
    if(!client) { return res.status(404).end();}

    client.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).end();
    });
  });
};

exports.kickout = function(req, res){
  Device.findById(req.params.id, function (err, device) {
    if(err) { return handleError(res, err); }
    if(!device) { return res.status(404).end(); }

    Client.findOne({jobid:device.jobid}, function (err, client) {

      if(err) { return handleError(res, err); }
      if(!client) { return res.send(404); }
      client.remove(function(err) {
        if(err) { return handleError(res, err); }
        return res.status(204).end();
      });

    });
   
  });
};

function handleError(res, err) {
  return res.send(500, err);
}