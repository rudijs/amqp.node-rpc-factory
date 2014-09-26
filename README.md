amqp-rpc-factory
================

Nodejs AMQP RPC Consumer and Publisher Factory

The consumer and publisher make pervasive use of Javascript Promises.

## Dependencies

- A running RabbitMQ server
- NodeJS

## Terminolgy

RabbitMQ is a message broker.

Messaging brokers receive messages from publishers (applications that publish them, also known as producers) and route them to consumers (applications that process them).

NodeJS will act as both consumer and publisher.

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

Check out the [examples](examples) for more details of the basic and advanced features.

## Consumer Options

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

- gulp test
- TEST_QUIET=true gulp test (stubs out the logging output on the console)
- gulp lint
