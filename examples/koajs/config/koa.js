'use strict';

var router = require('koa-router'),
  controller = require('../controllers/controller-upcase');

module.exports = function (app) {

  app.use(router(app));

  app.get('/api/upcase/:text', function *() {
    try {
      var text = yield controller.upcase(this.params.text);
      this.body = text;
    }
    catch (e) {
      this.body = e;
    }
  });

};
