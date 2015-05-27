'use strict';

var router = require('koa-router')(),
  controller = require('../controllers/controller-upcase');

module.exports = function (app) {

  router.get('/api/upcase/:text', function *() {
    try {
      var text = yield controller.upcase(this.params.text);
      this.body = text;
    }
    catch (e) {
      this.body = e;
    }
  });

  app
    .use(router.routes())
    .use(router.allowedMethods());

};
