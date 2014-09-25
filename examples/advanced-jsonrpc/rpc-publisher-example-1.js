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
  log = require('../advanced/log');

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

/**
 * Example 1
 * Send: {"jsonrpc":"2.0","method":"upcase","params":"hello world","id":101}
 * Receive: {"jsonrpc":"2.0","result":"HELLO WORLD","id":101}
 */

var jsonRpcMessage = JSON.stringify({
  jsonrpc: '2.0',
  method: 'upcase',
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
