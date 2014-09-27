koajs
=====

KoaJS requires Nodejs version 0.11.x

This example uses the advanced-jsonrpc rpc-consumer.

- Start the advanced-jsonrpc consumer
- Start the web server (KoaJS) `node --harmony server.js`
- Open the URL http://localhost:3000/api/upcase/foo
- The response should be FOO

Any connection errors or request timeouts will return:

`{"status":503,"message":"Service Unavailable"}`
