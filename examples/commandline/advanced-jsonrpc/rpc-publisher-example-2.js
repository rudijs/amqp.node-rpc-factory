'use strict';

/**
 * Usage Examples:
 *
 * node rpc-publisher.js
 * or
 * RABBITMQ_URL='user:password@192.168.33.10/vhost' node rpc-publisher-example-2.js
 *
 */

var log = require('../advanced/log');

var publisherOptions = {
  standalone: true,

  debugLevel: 2,

  replyTimeOutInterval: 10000,

  url: process.env.RABBITMQ_URL || 'localhost',

  logInfo: function (msg) {
    log.info(msg);
  },

  logError: function (msg) {
    log.warn(msg);
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

/**
 * Example 2
 * Send: {"jsonrpc":"2.0","method":"lowercase","params":"hello world","id":101}
 * Receive: {"jsonrpc":"2.0","error":{"code":-32601,"message":"Method not found"},"id":101}
 */

var jsonRpcMessage = JSON.stringify({
  jsonrpc: '2.0',
  method: 'lowercase',
  params: 'hello world',
  id: 101
});

client.publish(jsonRpcMessage)
  .then(function publishSuccess(res) {
    console.log('Success:', res);
  })
  .catch(function publishError(err) {
    console.log('Error:', err);
  });
