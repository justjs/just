var just = require('./core');
var defineProperties = require('./internals/defineProperties');

just.register({'defineProperties': defineProperties});

module.exports = defineProperties;
