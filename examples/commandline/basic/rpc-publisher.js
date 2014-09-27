'use strict';

/**
 * Usage Examples:
 *
 * node rpc-publisher.js
 * or
 * RABBITMQ_URL='user:password@192.168.33.10/vhost' node rpc-publisher.js
 *
 * NOTE:
 * In the examples below we use 'require('../../../.')' but you'd use require('amqp-rpc-factory') with your own code
 *
 */

var publisherOptions = {
  standalone: true,
  url: process.env.RABBITMQ_URL || 'localhost'
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