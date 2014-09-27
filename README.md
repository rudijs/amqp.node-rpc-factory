amqp-rpc-factory
================

Nodejs AMQP RPC Consumer and Publisher Factory

The consumer and publisher make pervasive use of Javascript Promises.

Code review, suggestions and pull requests very much welcome - thanks!

## Credits

- Built on top of the fantastic [amqplib](https://github.com/squaremo/amqp.node) library
- My faithful coding pair partners:
- [mocha[(http://visionmedia.github.io/mocha/)
- [sinon.js](http://sinonjs.org/)
- [gulpjs](http://gulpjs.com/)
- [istanbul-js](http://gotwarlost.github.io/istanbul/)

## Dependencies

- A running RabbitMQ server
- NodeJS

## Overview

RabbitMQ is a message broker.

Messaging brokers receive messages from publishers (applications that publish them, also known as producers) and route them to consumers (applications that process them).

amqp-rpc-factory creates AMQP RPC consumers and publishers.

Here's an image from the RabbitMQ website giving an overview of the RPC messaging process.

In this context NodeJS is the blue circles, in between the NodeJS is TCP networking and the RabbitMQ server.

[![RPC Overview](docs/images/python-six.png)](https://www.rabbitmq.com/tutorials/tutorial-six-python.html)

## Features

- Create an RPC consumer
- Create an RPC producer (command line use opens and closes a TCP connection per message)
- Create an RPC producer (server use opens a single TCP connection then opens and closes channels per message)
- Consumer graceful error control and retry
- Producer graceful error control and timeout

## Install

- `npm install amqp-rpc-factory`

## Usage

- Create a simple RPC consumer and publisher that connect to RabbitMQ on localhost
- The publisher will send a text string, the consumer will append '-OK' to the text string and return it.
- You will need two terminals, one for the consumer and one for the producer

*Consumer*

```
var consumerOptions = {
  url: process.env.RABBITMQ_URL || 'localhost'
};

var consumer = require('rpc-consumer-factory').create(consumerOptions);

consumer.run();
```

*Publisher*

```
var rpcClientFactory = require('rpc-publisher-factory');

var client = rpcClientFactory.create({
  standalone: true,
  url: process.env.RABBITMQ_URL || 'localhost'
});

client.publish('message in a bottle')
  .then(function publishSuccess(res) {
    console.log(res);
  })
  .catch(function publishError(err) {
    console.log(err);
  });
```

Check out the [examples](examples) for more details of the basic, advanced, advanced-jsonrpc and server features.

## Consumer Options

- The function to handle processing the RPC request
- connectionRetryInterval (default: 500ms)
- url (RabbitMQ server. default: 'localhost')
- queue (default: 'node_rpc_queue')
- logInfo (log non error messages, default console.info - Can pass in custom logger (example Bunyan)
- logError (log error messages, default console.warn - Can pass in custom logger (example Bunyan)

## Publisher Options

- debugLevel (default: 0 - level 1 will log sent messages, level 2 will also log received messages)
- replyTimeOutInterval (default: 3000 - publisher timeout waiting for replies)
- standalone (default: false - Close the connection or channel on finish. If used in a server like ExpressJS or KoaJS needs to be true)
- url (RabbitMQ server. default: 'localhost')
- queue (default: 'node_rpc_queue')
- logInfo (log non error messages, default console.info - Can pass in custom logger (example Bunyan)
- logError (log error messages, default console.warn - Can pass in custom logger (example Bunyan)

## Tests

- git clone git@github.com:rudijs/amqp.node-rpc-factory.git
- cd amqp.node-rpc-factory
- npm install
- gulp test
- TEST_QUIET=true gulp test (stubs out the logging output on the console)
- gulp lint

## Development

- gulp watch-test
- TEST_QUIET=true watch-test
- gulp watch-lint
