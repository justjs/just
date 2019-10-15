var just = require('./core');
var defineProperty = require('./internals/defineProperty');

just.register({'defineProperty': defineProperty});

module.exports = defineProperty;
