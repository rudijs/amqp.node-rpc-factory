'use strict';

// RPC Method dispatch table
// The properties names on this object defined what JSON-RPC methods this consumer can respond to
var rpcMethodTable = {

  upcase: function (request) {
    return JSON.stringify({
      jsonrpc: '2.0',
      result: request.params.toUpperCase(),
      id: request.id
    });
  }

};

exports.jsonRpc = function (msg) {

  var request = JSON.parse(msg.content.toString());

  if (rpcMethodTable[request.method]) {
    return rpcMethodTable[request.method](request);
  }
  else {

    return JSON.stringify({
      jsonrpc: '2.0',
      error: {
        code: -32601,
        message: 'Method not found'
      },
      id: request.id
    });

  }

};