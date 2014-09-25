'use strict';

var amqp = require('amqplib'),
  _ = require('lodash'),
  q = require('q'),
  uuid = require('uuid'),
  domain = require('domain');

var rpcPublisherProto = {

  publisherDomain: domain.create(),

  currentConnection: null,

  publisherDomainOnError: function () {
    this.publisherDomain.on('error', function (err) {
      console.log('AMQPLIB error handled by domain:', err.stack);
      this.connection = null;
      this.publisherDomain.remove(this.currentConnection);
    }.bind(this));
  },

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

    if (this.debugLevel >= 1) {
      this.logInfo('Publishing: ' + msg);
    }

    return this.getConnection()
      .then(function connectSuccess(conn) {

        this.currentConnection = conn;
        this.publisherDomain.add(this.currentConnection);

        return conn.createChannel()
          .then(function createChannelSucces(ch) {

            var answer = q.defer();
            var corrId = uuid.v4();
            var replyQueue;

            var replyTimeOut = setTimeout(function () {
              answer.reject(Error('RPC Reply Timeout'));
            }, this.replyTimeOutInterval);

            // Capitalize this function as its used with a this binding
            function MaybeAnswer(msg) {
              if (msg.properties.correlationId === corrId) {
                if (this.debugLevel >= 2) {
                  this.logInfo('RPC Response: ' + msg.content.toString());
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
                return ch.consume(replyQueue, MaybeAnswer.bind(this), {noAck: true});
              }.bind(this))
              .then(function consumeSuccess() {
                ch.sendToQueue(this.queue, new Buffer(msg), {
                  expiration: this.replyTimeOutInterval,
                  correlationId: corrId,
                  replyTo: replyQueue
                });
                return answer.promise;
              }.bind(this))
              .catch(function (error) {
                // Return Error to the outer .catch()
                var deferred = q.defer();
                deferred.reject(error);
                return deferred.promise;
              })
              .finally(function () {
                if (this.standalone) {
                  conn.close();
                }
                else {
                  ch.close();
                }
              }.bind(this));

          }.bind(this));

      }.bind(this))
      .catch(function (err) {

        // Log the error
        this.logError('catch' + err.stack);

        // Reset the connection
        this.connection = null;

        // Return a rejected promise with status and message
        var deferred = q.defer();
        deferred.reject({status: 503, message: 'Service Unavailable'});
        return deferred.promise;
      }.bind(this));

  }

};

exports.create = function (options) {
  var publisher = Object.create(_.extend(rpcPublisherProto, options || {}));
  publisher.publisherDomainOnError();
  return publisher;
};
