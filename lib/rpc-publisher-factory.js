'use strict';

var amqp = require('amqplib'),
  _ = require('lodash'),
  q = require('q'),
  uuid = require('uuid'),
  domain = require('domain');

var logInfoDefault = function (msg) {
  console.log(msg);
};

var logErrorDefault = function (msg) {
  console.log(msg);
};

var rpcPublisherProto = {
  uri: function () {
    if (this.url.match(/amqps?:\/\//)) {
      return this.url;
    }
    return ['amqp://', this.url].join('');
  },
  publisherDomain: domain.create(),

  init: function (options) {
    options = options || {};
    this.replyTimeOutInterval = options.replyTimeOutInterval || 3000;
    this.url = options.url || 'localhost';
    this.socketOptions = options.socketOptions || {};
    this.queue = options.queue || 'node_rpc_queue';
    this.queueOptions = options.queueOptions || {exclusive: true, autoDelete: true};
    this.debugLevel = options.debugLevel || 0;
    this.standalone = options.standalone || false;
    this.logInfo = options.logInfo || logInfoDefault;
    this.logError = options.logError || logErrorDefault;

    this.currentConnection = null;
    this.connection = null;

    return this;
  },

  publisherDomainOnError: function () {
    this.publisherDomain.on('error', function (err) {
      this.logError('Publisher: Unexpected amqplib connection error handled by domain:' + err.stack);
      this.connection = null;
      this.publisherDomain.remove(this.currentConnection);
    }.bind(this));
  },

  getConnection: function () {
    if (!this.connection) {
      this.logInfo('Publisher: Connecting to RabbitMQ server');
      this.createConnection();
    }
    return this.connection;
  },

  createConnection: function () {
    this.connection = amqp.connect(this.uri(), this.socketOptions);
  },

  publish: function (msg) {

    if (this.debugLevel >= 1) {
      this.logInfo('Publisher: Publishing: ' + msg);
    }

    return this.getConnection()
      .then(function connectSuccess(conn) {

        if (_.isNull(this.currentConnection)) {
          this.currentConnection = conn;
          if (this.standalone === false) {
            conn.on('close', function (err) {
              this.connection = null;
              this.currentConnection = null;
            });
          }
          this.publisherDomain.add(this.currentConnection);
        }

        return conn.createChannel()
          .then(function createChannelSucces(ch) {

            var answer = q.defer();
            var corrId = uuid.v4();
            var replyQueue;

            var replyTimeOut = setTimeout(function () {
              answer.reject(new Error('RPC Reply Timeout'));
            }, this.replyTimeOutInterval);

            // Capitalize this function as its used with a this binding
            function MaybeAnswer(msg) {
              if (msg.properties.correlationId === corrId) {
                if (this.debugLevel >= 2) {
                  this.logInfo('Publisher: RPC Response: ' + msg.content.toString());
                }
                answer.resolve(msg.content.toString());
              }
              else {
                answer.reject(new Error('RPC replyTo.correlationId mismatch'));
              }
              clearTimeout(replyTimeOut);
            }

            return ch.assertQueue('', this.queueOptions)
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
                return q.reject(error);
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
        this.logError('Publisher: ' + err.stack);

        // Reset the connection.
        /**
         * If the error is an RPC Reply Timeout the connection to RabbitMQ is OK.
         * The consumer is not responding, it's OK to continue to use the existing RabbitMQ connection.
         */
        if (err.message !== 'RPC Reply Timeout') {
          this.connection = null;
          this.currentConnection = null;
        }

        // Return a rejected promise.
        /**
         * code: The HTTP Status code
         * message: The application/machine message
         * data: The Human readable message
         */
        return q.reject({
          code: 503,
          message: 'service_unavailable',
          data: 'Service Unavailable.'
        });

      }.bind(this));

  }

};

var create = function create(options) {
  var publisher = Object.create(rpcPublisherProto).init(options);
  publisher.publisherDomainOnError();
  return publisher;
};

exports.create = create;
