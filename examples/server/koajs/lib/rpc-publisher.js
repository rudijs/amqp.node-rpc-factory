'use strict';

var rpcPublisherFactory = require('../../../../.').publisher;

var publisher = null;

if (!publisher) {
  publisher = rpcPublisherFactory.create({
    url: process.env.RABBITMQ_URL || 'localhost'
  });
}

module.exports = publisher;
