## Terminolgy

Messaging brokers receive messages from publishers (applications that publish them, also known as producers)
and route them to consumers (applications that process them).

## Basic Example: Consumer

rpc-consumer.js is an example of a basic AMQP RPC Consumer.

Default behavior is:

- Connect to localhost.
- Attempt to reconnect non-stop every 500ms (1/2 second) if the connection fails.
- Create a persistent (if it does not exist) and consume messages from the 'node_rpc_queue' queue.
- This default consumer will simply append '-OK' to the message it receives and returns it.
- Send replies to an exclusive 'reply queue' created by the message publisher.
- Logging output is to console.info and console.warn

## Basic Example: Publisher

rpc-publisher.js is an example of a basic command line AMQP RPC Publisher.

The publisher client is a Javascript Promise object.

This publisher will simply send a string and listen for the reply.

Default behavior is:

- Connect to localhost.
- Exit immediately if it cannot connect.
- Send messages to the 'node_rpc_queue' queue.
- Promise resolves on correct RPC response.
- Promise rejects on incorrect RPC response (mismatched correlationId).
- Promise rejects on Timeout after 3000ms (3 seconds) if no response.
- If there's a timeout the sent RPC request is expired (removed) from the 'node_rpc_queue'.
- Timeouts can occur if there is no running consumer or if the consumer is unable to reply within 3000ms.
- Logging output is to console.info and console.warn

The publisher can be run manually, via cron job or executed by another program.

It's important to note that each execution will create and close a TCP connection per RPC message

Check out the [web server example](koajs) for an example of a single persistent TCP connection that creates and destroys channels.
