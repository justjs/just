var just = require('./core');
var defineProperty = require('./internals/defineProperty');

module.exports = just.register({'defineProperty': defineProperty}).defineProperty;
