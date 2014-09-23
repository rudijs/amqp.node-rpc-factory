'use strict';

var rpcPublisherFactory = require('./rpc-publisher-factory');

var publisher = null;

if (!publisher) {
  publisher = rpcPublisherFactory.create({
    url: 'rsm_user:abcdef@rmq01.dev.loc.ridesharemarket.com/rsm',
    queue: 'rsm_rpc_queue'
  });
}

// If an existing (and shared) RabbitMQ connection goes disconnects it will throw an exception.
// We don't want the web app to stop.
//
// Log the exception message
//
// Check the error stack for the keywords 'amqplib/lib/connection.js'
// If found reset the entire TCP connection to null
// The publish attempt will rebuild the TCP connection (and share and re-use it)
//
// If 'amqplib/lib/connection.js' is not found, rethrow the error (crash the node app - upstart/forever will restart)


// http://www.squaremobius.net/amqp.node/doc/channel_api.html

process.on('uncaughtException', function (err) {

  // Look for amqp in the exception message
  var pattern = /amqplib\/lib\/connection\.js/g;

  if (pattern.test(err.stack)) {

    //logger.error('Caught uncaughtException Node process exception: ' + err.stack);
    console.log('Caught amqplib exception: ' + err.stack);

    publisher.connection = null;
  }
  else {
    // rethrow the error, crash the node process (upstart will restart)
    throw new Error(err.stack);
  }

});

module.exports = publisher;
