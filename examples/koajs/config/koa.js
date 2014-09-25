'use strict';

var router = require('koa-router'),
  controller = require('../controllers/controller-upcase');

module.exports = function (app) {

  app.use(router(app));

  app.get('/api/upcase/:text', function *() {
    try {
      var members = yield controller.upcase(this.params.text);
      this.body = members;
    }
    catch (e) {
      //console.log(e);
      this.status = e.status;
      this.body = e;
    }
  });

};
