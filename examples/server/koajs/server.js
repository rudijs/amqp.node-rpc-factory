'use strict';

var koa = require('koa'),
  app = koa();

// Configure the KoaJS app middleswares
require('./config/koa')(app);

app.listen(3000);
