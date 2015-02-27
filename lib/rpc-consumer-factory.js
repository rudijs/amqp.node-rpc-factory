'use strict';

var amqp = require('amqplib'),
  _ = require('lodash'),
  q = require('q');

var logInfoDefault = function(msg) {
  console.log(msg);
}

var logErrorDefault = function(msg) {
  console.log(msg);
}

var processMessageDefault = function(msg) {
  var input = msg.content.toString();
  this.logInfo('Consumer RPC input: ' + input);
  return input + '-OK';
}

var rpcConsumerProto = {

  uri: function () {
    if(_.startsWith('amqp://') || _.startsWith('amqps://')) {
      return this.url;
    }
    return ['amqp://', this.url].join('');
  },

  init : function(options) {
    options = options || {};
    this.connectionRetryInterval  = options.connectionRetryInterval || 500;
    this.url = options.url || 'localhost';
    this.socketOptions = options.socketOptions || {};
    this.queue = options.queue || 'node_rpc_queue';
    this.queueOptions = options.queueOptions || {durable: true};
    this.prefetch = options.prefetch || 1;

    this.logInfo = options.logInfo || logInfoDefault;
    this.logError = options.logError || logErrorDefault;

    this.processMessage = options.processMessage || processMessageDefault;

    return this;
  },

  connect: function () {

    amqp.connect(this.uri(), this.socketOptions).then(function getConnectionSuccess(conn) {

      conn.on('error', function (err) {
        this.logError(err.stack);
        this.reconnect();
      }.bind(this));

      return conn.createChannel().then(function createChannelSuccess(ch) {

        // Capitalize this function as its used with a this binding
        function Reply(msg) {

          // process request
          var response;

          // If this.processMessage is a Q promise, returns the promise.
          // If this.processMessage is not a promise, returns a promise that is fulfilled with value.
          q(this.processMessage(msg))
            .then(function processMessageSuccess(res) {
              response = res;
            })
            .catch(function processMessageError(err) {
              response = err;
            })
            .finally(function() {
              // send response
              ch.sendToQueue(msg.properties.replyTo, new Buffer(response.toString()), {correlationId: msg.properties.correlationId});
              ch.ack(msg);
            });

        }

        return ch.assertQueue(this.queue, this.queueOptions)
          .then(function assertQueueSuccess() {
            ch.prefetch(this.prefetch);
            return ch.consume(this.queue, Reply.bind(this));
          }.bind(this))
          .then(function consumeSuccess() {
            this.logInfo('Consumer: Waiting for RPC requests on: ' + this.queue);
          }.bind(this));

      }.bind(this));
    }.bind(this))
      .catch(function (error) {
        this.logError('Consumer: AMQP Connect Error: ' + error.stack);
        this.reconnect();
      }.bind(this));
  },

  reconnect: function () {
    this.logInfo('Consumer: Reconnecting');
    setTimeout(this.connect.bind(this), this.connectionRetryInterval);
  },

  run: function () {
    this.connect();
  }
};

exports.create = function(options) {
  return Object.create(rpcConsumerProto).init(options);
};
