'use strict';

/**
 * Usage Examples:
 *
 * node rpc-publisher.js
 * or
 * RABBITMQ_URL='user:password@192.168.33.10/vhost' node rpc-publisher.js
 *
 */

var log = require('./log');

var publisherOptions = {
  standalone: true,

  debugLevel: 2,

  replyTimeOutInterval: 10000,

  url: process.env.RABBITMQ_URL || 'localhost',

  logInfo: function (msg) {
    log.info(msg);
  },

  logError: function (msg) {
    log.error(msg);
  }
};

/**
 * Option 1 - Single line
 */

var client = require('../../../.').publisher.create(publisherOptions);

/**
 * Option 2 - Multi line
 */

//var rpcClientFactory = require('../../../.').publisher;
//var client = rpcClientFactory.create(publisherOptions);

// Do RPC
client.publish('message in a bottle')
  .then(function publishSuccess(res) {
    console.log('Success:', res);
  })
  .catch(function publishError(err) {
    console.log('Error:', err);
  });
