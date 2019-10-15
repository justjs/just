var just = require('./core');
var defineProperties = require('./internals/defineProperties');

module.exports = just.register({'defineProperties': defineProperties}).defineProperties;
