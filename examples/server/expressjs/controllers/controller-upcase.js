'use strict';

var q = require('q');

var client = require('../lib/rpc-publisher');

var upcase = function upcase(text) {

  if(text) {

    var jsonRpcMessage = JSON.stringify({
      jsonrpc: '2.0',
      method: 'upcase',
      params: text,
      id: 101
    });

    return client.publish(jsonRpcMessage)
      .then(function publishSuccess(res) {
        var jsonRpc = JSON.parse(res);
        return q.resolve(jsonRpc.result);
      })
      .catch(function publishError(err) {
        return q.reject(err);
      });
  }
  else {
    return q.reject('Invalid Text Input');
  }

};

exports.upcase = upcase;
