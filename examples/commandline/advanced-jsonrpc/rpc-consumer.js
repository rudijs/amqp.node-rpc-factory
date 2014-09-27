'use strict';

/**
 * Usage Examples:
 *
 * node rpc-consumer.js
 * or
 * RABBITMQ_URL='user:password@192.168.33.10/vhost' node rpc-consumer.js
 *
 */

var log = require('../advanced/log'),
  processMessage = require('./process-message');

var consumerOptions = {

  url: process.env.RABBITMQ_URL || 'localhost',

  logInfo: function(msg) {
    log.info(msg);
  },

  logError: function(msg) {
    log.error(msg);
  },

  processMessage: processMessage.jsonRpc
};

var consumer;

/**
 * Option 1 - Single line
 */
consumer = require('../../../.').consumer.create(consumerOptions).run();

/**
 * Option 2- Multi line
 */

//var rpcConsumerFactory = require('../../../.').consumer;
//consumer = rpcConsumerFactory.create(consumerOptions);
//consumer.run();
