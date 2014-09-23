'use strict';

var amqp = require('amqplib'),
  _ = require('lodash'),
  q = require('q'),
  uuid = require('uuid');

var rpcPublisherProto = {

  standalone: false,

  connection: null,

  url: 'localhost',

  queue: 'node_rpc_queue',

  logInfo: function (msg) {
    console.log(msg);
  },

  logError: function (msg) {
    console.log(msg);
  },

  uri: function () {
    return ['amqp://', this.url].join('');
  },

  getConnection: function () {
    this.logInfo('rpcClient.getConnection');
    if (!this.connection) {
      this.logInfo('No connection so creating one');
      this.createConnection();
    }
    else {
      this.logInfo('Existing connection');
    }
    return this.connection;
  },

  createConnection: function () {
    this.logInfo('rpcClient.createConnection');
    this.connection = amqp.connect(this.uri());
  },

  publish: function (msg) {

    var ctx = this;

    ctx.logInfo('Sending ' + msg);

    return ctx.getConnection()
      .then(function connectSuccess(conn) {

        return conn.createChannel()
          .then(function createChannelSucces(ch) {

            var answer = q.defer();
            var corrId = uuid.v4();
            var replyQueue;

            function maybeAnswer(msg) {
              if (msg.properties.correlationId === corrId) {
                ctx.logInfo('Got Response ' + msg.content.toString());
                answer.resolve(msg.content.toString());
              }
              else {
                console.log('maybeAnswer', msg.properties);
              }
            }

            return ch.assertQueue('', {exclusive: true})
              .then(function assertQueueSuccess(qok) {
                replyQueue = qok.queue;
                return ch.consume(replyQueue, maybeAnswer, {noAck: true});
              })
              .then(function consumeSuccess() {
                ch.sendToQueue(ctx.queue, new Buffer(msg), {
                  correlationId: corrId,
                  replyTo: replyQueue
                });
                return answer.promise;
              })
              .catch(function (error) {
                ctx.logError(error);
              })
              .finally(function () {
                if (ctx.standalone) {
                  ctx.logInfo('Standalone Mode Closing Connection');
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
