'use strict';

var amqp = require('amqplib'),
  _ = require('lodash'),
  q = require('q'),
  uuid = require('uuid');

var rpcPublisherProto = {

  debugLevel: 0,

  replyTimeOutInterval: 3000,

  standalone: false,

  connection: null,

  url: 'localhost',

  queue: 'node_rpc_queue',

  logInfo: function (msg) {
    console.info(msg);
  },

  logError: function (msg) {
    console.warn(msg);
  },

  uri: function () {
    return ['amqp://', this.url].join('');
  },

  getConnection: function () {
    if (!this.connection) {
      this.logInfo('Connecting to RabbitMQ server');
      this.createConnection();
    }
    return this.connection;
  },

  createConnection: function () {
    this.connection = amqp.connect(this.uri());
  },

  publish: function (msg) {

    var ctx = this;

    if (ctx.debugLevel >= 1) {
      ctx.logInfo('Publishing: ' + msg);
    }

    return ctx.getConnection()
      .then(function connectSuccess(conn) {

        return conn.createChannel()
          .then(function createChannelSucces(ch) {

            var answer = q.defer();
            var corrId = uuid.v4();
            var replyQueue;

            var replyTimeOut = setTimeout(function () {
              answer.reject(Error('RPC Reply Timeout'));
            }, ctx.replyTimeOutInterval);

            function maybeAnswer(msg) {
              if (msg.properties.correlationId === corrId) {
                if (ctx.debugLevel >= 2) {
                  ctx.logInfo('RPC Response ' + msg.content.toString());
                }
                answer.resolve(msg.content.toString());
              }
              else {
                answer.reject(Error('RPC replyTo.correlationId mismatch'));
              }
              clearTimeout(replyTimeOut);
            }

            return ch.assertQueue('', {exclusive: true})
              .then(function assertQueueSuccess(qok) {
                replyQueue = qok.queue;
                return ch.consume(replyQueue, maybeAnswer, {noAck: true});
              })
              .then(function consumeSuccess() {
                ch.sendToQueue(ctx.queue, new Buffer(msg), {
                  expiration: ctx.replyTimeOutInterval,
                  correlationId: corrId,
                  replyTo: replyQueue
                });
                return answer.promise;
              })
              .catch(function (error) {
                // Return Error to the outer .catch()
                var deferred = q.defer();
                deferred.reject(error);
                return deferred.promise;
              })
              .finally(function () {
                if (ctx.standalone) {
                  conn.close();
                }
              });

          });

      })
      .catch(function (err) {

        // Log the error
        ctx.logError(err.stack);

        // Reset the connection
        ctx.connection = null;

        // Return a rejected promise with status and message
        var deferred = q.defer();
        deferred.reject({status: 503, message: 'Service Unavailable'});
        return deferred.promise;
      });

  }

};

exports.create = function (options) {
  return Object.create(_.extend(rpcPublisherProto, options || {}));
};
