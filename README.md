amqp-rpc-factory
================

Node.js AMQP RPC Consumer and Publisher Factory

The consumer and publisher make pervasive use of Javascript Promises.

[![Build Status](https://travis-ci.org/rudijs/amqp.node-rpc-factory.svg?branch=master)](https://travis-ci.org/rudijs/amqp.node-rpc-factory)
[![Coverage Status](https://coveralls.io/repos/rudijs/amqp.node-rpc-factory/badge.png?branch=master)](https://coveralls.io/r/rudijs/amqp.node-rpc-factory?branch=master)
[![NPM version](https://badge.fury.io/js/amqp-rpc-factory.svg)](http://badge.fury.io/js/amqp-rpc-factory)
[![Dependency Status](https://gemnasium.com/rudijs/amqp.node-rpc-factory.svg)](https://gemnasium.com/rudijs/amqp.node-rpc-factory)

Code review, suggestions and pull requests very much welcome - thanks!

## Credits

- Built on top of the fantastic [amqplib](https://github.com/squaremo/amqp.node) library
- My faithful coding pair partners:
- [mocha](http://visionmedia.github.io/mocha/)
- [sinon.js](http://sinonjs.org/)
- [chai](http://chaijs.com/)
- [gulpjs](http://gulpjs.com/)
- [istanbul-js](http://gotwarlost.github.io/istanbul/)

## Dependencies

- A running [RabbitMQ](http://www.rabbitmq.com/) server
- [Node.js](http://nodejs.org/)

## Overview

RabbitMQ is a message broker.

Messaging brokers receive messages from publishers (applications that publish them, also known as producers) and route them to consumers (applications that process them).

`amqp-rpc-factory` creates AMQP RPC consumers and publishers.

Here's an image from the RabbitMQ website giving an overview of the RPC messaging process.

In this context Node.js is the blue circles, in between Node.js is TCP networking and the RabbitMQ server.

![RPC Overview](examples/images/python-six.png)

For more details see the [RabbitMQ Tutorial - Remote procedure call (RPC)](https://www.rabbitmq.com/tutorials/tutorial-six-python.html)

## Features

- Create an RPC consumer
- Create an RPC producer (command line use opens and closes a TCP connection per message)
- Create an RPC producer (server use opens a single TCP connection then opens and closes channels per message)
- Consumer graceful error control and retry
- Producer graceful error control and timeout

## Install

- `npm install amqp-rpc-factory`

## Usage Example

- Create a simple RPC consumer and publisher that connect to a RabbitMQ server running on localhost
- The publisher will send a text string, the consumer will append '-OK' to the text string and return it.
- You will need two terminals, one for the consumer and one for the producer

*Consumer - rpc-consumer.js*

    // Usage: node rpc-consumer.js

    var consumerOptions = {
      url: process.env.RABBITMQ_URL || 'localhost'
    };

    var consumer = require('amqp-rpc-factory').consumer.create(consumerOptions);

    consumer.run();

*Publisher - rpc-publisher.js*

    // Usage: node rpc-publisher.js

    var rpcPublisherFactory = require('amqp-rpc-factory').publisher;

    var publisher = rpcPublisherFactory.create({
      standalone: true,
      url: process.env.RABBITMQ_URL || 'localhost'
    });

    publisher.publish('message in a bottle')
      .then(function publishSuccess(res) {
        console.log(res);
      })
      .catch(function publishError(err) {
        console.log(err);
      });

Check out the [examples](examples) for more details of the basic, advanced, advanced-jsonrpc and server features.

## Consumer Options

- `processMessage`: The function to handle processing the RPC request. Can standard Javascript Function or return a fulfilled Promise.
- `connectionRetryInterval`: default: 500ms
- `url`: default: 'localhost'
- `socketOptions`: default empty Object
- `queue`: default: 'node_rpc_queue'
- `logInfo`: Log non-error messages, default console.info - Can pass in custom logger (example Bunyan)
- `logError`: Log error messages, default console.warn - Can pass in custom logger (example Bunyan)

## Publisher Options

- `debugLevel`: default: 0 - level 1 will log sent messages, level 2 will also log received messages
- `replyTimeOutInterval`: default: 3000 - publisher timeout waiting for replies
- `standalone`: default: false - Close the connection or channel on finish. If used in a server like ExpressJS or KoaJS needs to be true
- `url`: default: 'localhost'
- `socketOptions`: default empty Object
- `queue`: default: 'node_rpc_queue'
- `logInfo`: Log non-error messages, default console.info - Can pass in custom logger (example Bunyan)
- `logError`: Log error messages, default console.warn - Can pass in custom logger (example Bunyan)

## Tests

- `git clone git@github.com:rudijs/amqp.node-rpc-factory.git`
- `cd amqp.node-rpc-factory`
- `npm install`
- `gulp test`
- `TEST_QUIET=true gulp test` (stubs out the logging output on the console)
- `gulp lint`

## Development

- `gulp watch-test`
- `TEST_QUIET=true watch-test`
- `gulp watch-lint`
