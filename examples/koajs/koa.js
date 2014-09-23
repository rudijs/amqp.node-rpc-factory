'use strict';

var helmet = require('koa-helmet'),
  compress = require('koa-compress'),
  router = require('koa-router'),
  requireWalk = require('require-walk'),
  koaJsonLogger = require('koa-json-logger'),
  koaJsonApiHeaders = require('koa-jsonapi-headers');

var config = require('../config/app');

module.exports = function (app) {

  app.use(helmet.defaults());

  // koa-json-logger will set content-type to application/vnd.api+json
  // but for oauth 302 redirects we will set the content-type to text/html
  app.use(function *(next) {
    yield next;
    if (this.status === 302) {
      this.response.type = 'text/html';
    }
  });

  app.use(koaJsonLogger({
    name: 'rsm-api',
    jsonapi: true
  }));

  app.use(koaJsonApiHeaders({excludeList: [
    'signin\/google',
    'auth\/google\\?code'
  ]}));

  app.use(compress());

  function *responseTime(next) {
    /*jshint validthis: true*/
    var start = new Date();
    yield next;
    var ms = new Date() - start;
    this.set('X-Response-Time', ms + 'ms');
    //console.log('%s %s %s - %s', this.ip, this.method, this.url, ms);
  }
  app.use(responseTime);

  app.use(router(app));

  // Routes
  requireWalk(config.get('root') + '/httpd/routes')(app);

};
