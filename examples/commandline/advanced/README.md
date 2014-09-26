## Advanced Example: Consumer

rpc-consumer.js is an example of a advanced AMQP RPC Consumer.

Default behavior is:

- Connect to localhost.
- Attempt to reconnect non-stop every 500ms (1/2 second) if the connection fails.
- Create a persistent (if it does not exist) and consume messages from the 'node_rpc_queue' queue.
- Send replies to an exclusive 'reply queue' created by the message publisher.

Customized behavior:

- Create a custom logger, using Bunyan, and pass that in options
- Create a custom process RPC function in processMessage.js and pass that in the options

## Advanced Example: Publisher

rpc-publisher.js is an example of a advanced command line AMQP RPC Publisher.

The publisher client is a Javascript Promise object.

This publisher will simply send a string and listen for the reply.

Default behavior is:

- Connect to localhost.
- Exit immediately if it cannot connect.
- The 'standalone' option is required so the connection will be closed, else the command line will hang on the open connection.
- Send messages to the 'node_rpc_queue' queue.
- Promise resolves on correct RPC response.
- Promise rejects on incorrect RPC response (mismatched correlationId).
- Promise rejects on Timeout after 3000ms (3 seconds) if no response.
- If there's a timeout the sent RPC request is expired (removed) from the 'node_rpc_queue'.

Customized behavior:

- Create a custom logger, using Bunyan, and pass that in options
- Increase the reply wait timeout to 10,000ms (10seconds)
- Increase the logging level to log then sent and received messages.
