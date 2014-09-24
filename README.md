amqp-rpc-factory
================

AMQP RPC Consumer and Publisher Factory

*Not yet ready for NPM publishing*

*Consumer*
Reconnects after disconnect

*Publisher*
Send a RPC request to RabbitMQ.
Standalone mode for command line use, closes the connection
Default mode keeps conenction open, for use in a server app like ExpressJS or KoaJS
Timeout value used in both sendToQueue and replyTo Queue

*Logging*
Default is standard out (console.log)
Can pass in custom logger (example Bunyan)

## Tests

- Without Code Coverage
- `npm test`

- With Code Coverage
- `npm test-coverage`
- `gulp test`
