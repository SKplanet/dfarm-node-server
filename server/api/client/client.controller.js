'use strict';

var _ = require('lodash');
var moment = require('moment');
var Client = require('./client.model');

// Get list of clients
exports.index = function(req, res) {
  Client.find(function (err, clients) {
    if(err) { return handleError(res, err); }

    var result = [];

    clients.forEach(function(client, i, context){
      result.push({
        _id: client._id,
        id : client.id,
        ip : client.ip,
        type: client.type,
        state: client.state,
        jobid: client.jobid,
        dispConnDate: moment(client.connectedAt).format('YYYY-MM-DD hh:mm:ss')
      });
    });

    return res.json(200, result);
  });
};

// Get a single client
exports.show = function(req, res) {
  Client.findById(req.params.id, function (err, client) {
    if(err) { return handleError(res, err); }
    if(!client) { return res.send(404); }
    return res.json(client);
  });
};

// Creates a new client in the DB.
exports.create = function(req, res) {
  Client.create(req.body, function(err, client) {
    if(err) { return handleError(res, err); }
    return res.json(201, client);
  });
};

// Updates an existing client in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Client.findById(req.params.id, function (err, client) {
    if (err) { return handleError(res, err); }
    if(!client) { return res.send(404); }
    var updated = _.merge(client, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, client);
    });
  });
};

// Deletes a client from the DB.
exports.destroy = function(req, res) {
  Client.findById(req.params.id, function (err, client) {
    if(err) { return handleError(res, err); }
    if(!client) { return res.send(404); }
    client.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}