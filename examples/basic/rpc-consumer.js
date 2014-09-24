'use strict';

/**
 * Usage Examples:
 *
 * node rpc-consumer.js
 * or
 * RABBITMQ_URL='user:password@192.168.33.10/vhost' node rpc-consumer.js
 *
 */

var consumerOptions = {
  url: process.env.RABBITMQ_URL || 'localhost'
};

var consumer = require('../../lib/rpc-consumer-factory').create(consumerOptions);

consumer.run();
