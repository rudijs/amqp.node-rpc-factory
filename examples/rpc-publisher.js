'use strict';

/**
 * Usage Examples:
 *
 * node rpc-publisher.js
 * or
 * RABBITMQ_URL='user:password@192.168.33.10/vhost' node rpc-publisher.js
 *
 */

var rpcClientFactory = require('../lib/rpc-publisher-factory');

var client = rpcClientFactory.create({
  standalone: true,
  url: process.env.RABBITMQ_URL || 'localhost'
});

client.publish('message in a bottle')
  .then(function publishSuccess(res) {
    console.log('publishSuccess', res);
  })
  .catch(function publishError() {
    console.log('error', arguments);
  });
