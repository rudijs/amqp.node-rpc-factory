'use strict';

var rpcPublisherFactory = require('../../../../lib/rpc-publisher-factory');
var publisher = null;

if (!publisher) {
  publisher = rpcPublisherFactory.create({
    url: process.env.RABBITMQ_URL || 'localhost'
  });
}

module.exports = publisher;
