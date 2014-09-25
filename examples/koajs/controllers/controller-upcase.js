'use strict';

var q = require('q');

var client = require('../lib/rpc-publisher');

var upcase = function upcase(text) {
  var deferred = q.defer();
  if(text) {

    var jsonRpcMessage = JSON.stringify({
      jsonrpc: '2.0',
      method: 'upcase',
      params: text,
      id: 101
    });

    client.publish(jsonRpcMessage)
      .then(function publishSuccess(res) {
        var jsonRpc = JSON.parse(res);
        deferred.resolve(jsonRpc.result);
      })
      .catch(function publishError(err) {
        deferred.reject(err);
      });
  }
  else {
    deferred.reject('Invalid Text Input');
  }
  return deferred.promise;
};

exports.upcase = upcase;
