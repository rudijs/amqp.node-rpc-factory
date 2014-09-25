'use strict';

var amqp = require('amqplib'),
  _ = require('lodash');

var rpcConsumerProto = {

  connectionRetryInterval: 500,

  url: 'localhost',

  queue: 'node_rpc_queue',

  logInfo: function(msg) {
    console.log(msg);
  },

  logError: function(msg) {
    console.log(msg);
  },

  uri: function () {
    return ['amqp://', this.url].join('');
  },

  processMessage: function(msg) {
    var input = msg.content.toString();
    this.logInfo(input);
    return input + '-OK';
  },

  connect: function () {

    amqp.connect(this.uri()).then(function getConnectionSuccess(conn) {

      conn.on('error', function (err) {
        this.logError(err.stack);
        this.reconnect();
      }.bind(this));

      return conn.createChannel().then(function createChannelSuccess(ch) {

        // Capitalize this function as its used with a this binding
        function Reply(msg) {

          // process request
          var response = this.processMessage(msg);

          // send response
          ch.sendToQueue(msg.properties.replyTo, new Buffer(response.toString()), {correlationId: msg.properties.correlationId});
          ch.ack(msg);
        }

        return ch.assertQueue(this.queue, {durable: true})
          .then(function assertQueueSuccess() {
            ch.prefetch(1);
            return ch.consume(this.queue, Reply.bind(this));
          }.bind(this))
          .then(function consumeSuccess() {
            //logger.info([consumerName, env, 'waiting for RPC requests'].join(' '));
            this.logInfo('Waiting for RPC requests on: ' + this.queue);
          }.bind(this));

      }.bind(this));
    }.bind(this))
      .catch(function (error) {
        this.logError('AMQP Connect Error: ' + error.stack);
        this.reconnect();
      }.bind(this));
  },

  reconnect: function () {
    this.logInfo('Reconnecting');
    setTimeout(this.connect.bind(this), this.connectionRetryInterval);
  },

  run: function () {
    this.connect();
  }
};

exports.create = function(options) {
  return Object.create(_.extend(rpcConsumerProto, options || {}));
};
