expressjs
=========

This example uses the advanced-jsonrpc rpc-consumer.

- Start the advanced-jsonrpc consumer
- Start the web server `node server.js`
- Open the URL http://localhost:8080/api/upcase/foo
- The response should be FOO

Any connection errors or request timeouts will return:

`{"status":503,"message":"Service Unavailable"}`
