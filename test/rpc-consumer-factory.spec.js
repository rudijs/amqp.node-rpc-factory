'use strict';

var should = require('chai').should(),
  q = require('q'),
  sinon = require('sinon'),
  amqp = require('amqplib');

var rpcConsumerFactory = require('../lib/rpc-consumer-factory');

describe('RPC Consumer', function () {

  afterEach(function (done) {
    if (amqp.connect.restore) {
      amqp.connect.restore();
    }
    done();
  });

  describe('Default Logging', function () {

    it('Uses console.log by default for logging', function (done) {

      var spies = {
        log: sinon.spy()
      };

      sinon.stub(console, 'log', function(msg) {
        spies.log(msg);
      });

      var consumer = rpcConsumerFactory.create();

      consumer.logInfo('Info message');
      consumer.logError('Error message');

      console.log.restore();

      sinon.assert.calledTwice(spies.log);
      sinon.assert.calledWith(spies.log, 'Info message');
      sinon.assert.calledWith(spies.log, 'Error message');

      done();
    });

  });

  describe('Initial Connection retry', function () {

    var spies;

    afterEach(function (done) {
      sinon.assert.calledOnce(spies.logError);
      sinon.assert.calledOnce(spies.logInfo);
      sinon.assert.calledWithMatch(spies.logInfo, /Reconnecting/);
      sinon.assert.calledOnce(spies.reconnect);
      done();
    });

    it('should reconnect on initial fail', function (done) {

      var deferred = q.defer();
      deferred.reject(new Error('Stubbed amqpClient.getConnection()'));
      sinon.stub(amqp, 'connect').returns(deferred.promise);

      var clock = sinon.useFakeTimers();

      // Set up a consumer with custom loggers that call test spys
      var consumer = rpcConsumerFactory.create({
        logInfo: function (msg) {
          spies.logInfo(msg);
        },
        logError: function (msg) {
          spies.logError(msg);
        }
      });

      spies = {
        reconnect: sinon.spy(consumer, 'reconnect'),
        logInfo: sinon.spy(),
        logError: sinon.spy()
      };

      consumer.run();

      clock.restore();

      done();

    });

  });

  describe('Consume and Reply', function () {

    it('should successfully consume, handle resolved RPC processing, respond and ack', function (done) {

      var assertQueueThenStub = {
        then: function (assertQueueSuccess) {
          // Callback sets prefetch() starts consume();
          assertQueueSuccess();

          return {
            catch: function () {
            }
          };
        }
      };

      var channelStub = {

        assertQueue: function () {
          return {
            then: function (callback) {
              callback();
              return assertQueueThenStub;
            }
          };
        },

        prefetch: function (count) {
          should.exist(count);
          count.should.equal(1);
        },

        consume: function (queue, callback) {
          queue.should.equal('node_rpc_queue');

          setImmediate(function () {
            callback({
              content: new Buffer('message in a bottle'),
              properties: {
                replyTo: 'channel-101-101-101',
                correlationId: '1234-1234-1234-1234'
              }
            });
          });
        },

        sendToQueue: function (replyTo, content, optionsObj) {
          setImmediate(function() {
            replyTo.should.equal('channel-101-101-101');
            content.toString().should.equal('message in a bottle-OK');
            optionsObj.correlationId.should.equal('1234-1234-1234-1234');
          });
        },

        ack: function (val) {
          val.content.toString().should.equal('message in a bottle');
          val.properties.replyTo.should.equal('channel-101-101-101');
          val.properties.correlationId.should.equal('1234-1234-1234-1234');
        }
      };

      var createChannelStub = {
        on: function () {
        },
        createChannel: function () {
          return {
            then: function (createChannelSuccess) {
              return createChannelSuccess(channelStub);
            }
          };
        }
      };

      var connectStub = {
        then: function (getConnectionSuccess) {
          return getConnectionSuccess(createChannelStub);
        }
      };

      sinon.stub(amqp, 'connect').returns(connectStub);

      var consumer = rpcConsumerFactory.create();

      consumer.run();

      done();

    });

    it('should successfully consume, handle rejected RPC processing, respond and ack', function (done) {

      var assertQueueThenStub = {
        then: function (assertQueueSuccess) {
          // Callback sets prefetch() starts consume();
          assertQueueSuccess();

          return {
            catch: function () {
            }
          };
        }
      };

      var channelStub = {

        assertQueue: function () {
          return {
            then: function (callback) {
              callback();
              return assertQueueThenStub;
            }
          };
        },

        prefetch: function (count) {
          should.exist(count);
          count.should.equal(1);
        },

        consume: function (queue, callback) {
          queue.should.equal('node_rpc_queue');

          setImmediate(function () {
            callback({
              content: new Buffer('message in a bottle'),
              properties: {
                replyTo: 'channel-101-101-101',
                correlationId: '1234-1234-1234-1234'
              }
            });
          });
        },

        sendToQueue: function (replyTo, content, optionsObj) {
          setImmediate(function() {
            replyTo.should.equal('channel-101-101-101');
            content.toString().should.equal('Rejected Promise from RPC Process Message');
            optionsObj.correlationId.should.equal('1234-1234-1234-1234');
          });
        },

        ack: function (val) {
          val.content.toString().should.equal('message in a bottle');
          val.properties.replyTo.should.equal('channel-101-101-101');
          val.properties.correlationId.should.equal('1234-1234-1234-1234');
        }
      };

      var createChannelStub = {
        on: function () {
        },
        createChannel: function () {
          return {
            then: function (createChannelSuccess) {
              return createChannelSuccess(channelStub);
            }
          };
        }
      };

      var connectStub = {
        then: function (getConnectionSuccess) {
          return getConnectionSuccess(createChannelStub);
        }
      };

      sinon.stub(amqp, 'connect').returns(connectStub);

      var consumer = rpcConsumerFactory.create({
        processMessage: function() {
          var deferred = q.defer();
          deferred.reject('Rejected Promise from RPC Process Message');
          return deferred.promise;
        }
      });

      consumer.run();

      done();

    });

  });

  describe('Existing Connection retry', function () {

    var onErrorSpy;

    afterEach(function (done) {
      sinon.assert.called(onErrorSpy);
      done();
    });

    it('should retry if the existing connection fails', function (done) {

      onErrorSpy = sinon.spy();

      var createChannelStub = {
        on: function (type, callback) {
          callback(new Error('Connection Error Retry'));
        },
        createChannel: function () {
          return {
            then: function () {
              this.on('error', onErrorSpy);
            }.bind(this)
          };
        }
      };

      var connectStub = {
        then: function (getConnectionSuccess) {
          getConnectionSuccess(createChannelStub);

          return {
            catch: function () {
            }
          };

        }
      };

      sinon.stub(amqp, 'connect').returns(connectStub);

      var consumer = rpcConsumerFactory.create();

      consumer.run();

      done();

    });

  });

});
