'use strict';

var bunyan = require('bunyan');

var log = bunyan.createLogger({
  name: 'rpc',
  streams: [{
    path: 'rpc.log'
  }]
});

module.exports = log;
