'use strict';

/**
 * Usage Examples:
 *
 * node rpc-consumer.js
 * or
 * RABBITMQ_URL='user:password@192.168.33.10/vhost' node rpc-consumer.js
 *
 * NOTE:
 * In the examples below we use 'require('../../../.')' but you'd use require('amqp-rpc-factory') with your own code
 *
 */

var consumerOptions = {
  url: process.env.RABBITMQ_URL || 'localhost'
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


