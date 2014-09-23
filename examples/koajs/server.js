var koa = require('koa'),
  app = koa();

// Configure the KoaJS app middleswares
require('./config/koa')(app);

// Setup the RabbitMQ RPC publisher
// This will use one TCP connection for the application to share, many channels can be created and used
require('./httpd/lib/rpc-publisher');

app.listen(3001);
