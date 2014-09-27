'use strict';

var process = function(msg) {
  var input = msg.content.toString();
  this.logInfo('Consumer received: ' + input);
  return input + '-ProcessedMessage';
};

module.exports = process;
