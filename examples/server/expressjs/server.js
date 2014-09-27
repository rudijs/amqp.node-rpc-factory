'use strict';

var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var router = express.Router();

var controller = require('./controllers/controller-upcase');

router.get('/upcase/:text', function(req, res) {
  return controller.upcase(req.params.text)
    .then(function upcaseSuccess(result) {
      res.send(result);
    })
    .catch(function upcaseError(err) {
      res.send(err);
    });
});

app.use('/api', router);

app.listen(port);

console.log('Server Listening on port ' + port);
