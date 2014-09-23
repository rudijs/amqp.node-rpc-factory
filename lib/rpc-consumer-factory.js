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

  processResponse: function(msg) {
    var input = msg.content.toString();
    this.logInfo(input);
    return input + '-OK';
  },

  connect: function () {

    var ctx = this;

    amqp.connect(ctx.uri()).then(function getConnectionSuccess(conn) {

      conn.on('error', function (err) {
        ctx.logError(err.stack);
        ctx.reconnect();
      });

      return conn.createChannel().then(function createChannelSuccess(ch) {

        function reply(msg) {

          // process request
          var response = ctx.processResponse(msg);

          // send response
          ch.sendToQueue(msg.properties.replyTo, new Buffer(response.toString()), {correlationId: msg.properties.correlationId});
          ch.ack(msg);
        }

        return ch.assertQueue(ctx.queue, {durable: true})
          .then(function assertQueueSuccess() {
            ch.prefetch(1);
            return ch.consume(ctx.queue, reply);
          })
          .then(function consumeSuccess() {
            //logger.info([consumerName, env, 'waiting for RPC requests'].join(' '));
            ctx.logInfo('Waiting for RPC requests on: ' + ctx.queue);
          });

      });
    })
      .catch(function (error) {
        ctx.logError('AMQP Connect Error: ' + error.stack);
        ctx.reconnect();
      });
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
