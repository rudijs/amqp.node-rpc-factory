'use strict';

/**
 * Usage Examples:
 *
 * node rpc-publisher.js
 * or
 * RABBITMQ_URL='user:password@192.168.33.10/vhost' node rpc-publisher.js
 *
 */

var rpcClientFactory = require('../../lib/rpc-publisher-factory'),
  log = require('./log');

var client = rpcClientFactory.create({
  standalone: true,
  debugLevel: 2,
  replyTimeOutInterval: 10000,
  url: process.env.RABBITMQ_URL || 'localhost',
  logInfo: function(msg) {
    log.info(msg);
  },
  logError: function(msg) {
    log.warn(msg);
  }
});

client.publish('message in a bottle')
  .then(function publishSuccess(res) {
    console.log('Success:', res);
  })
  .catch(function publishError(err) {
    console.log('Error:', err);
  });
