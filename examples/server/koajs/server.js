'use strict';

var koa = require('koa'),
  app = koa();

// Setup the RabbitMQ RPC publisher
// This will use one TCP connection for the application to share, many channels can be created and used
//require('./lib/rpc-publisher');

// Configure the KoaJS app middleswares
require('./config/koa')(app);

app.listen(3000);
