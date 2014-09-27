Server Examples
===============

These two server examples with ExpressJS and KoaJS example uses the example advanced-jsonrpc rpc-consumer.

- Start the advanced-jsonrpc consumer
- Start the web server (see example Readme)
- Open the URL  (see example Readme)
- The response should be upper-cased output of the input

If RabbitMQ is not running or you stop and start it the connection error is handled gracefully and does not crash the web server.

The web server will reconnect, and maintain a single TCP connection, with the next request.
