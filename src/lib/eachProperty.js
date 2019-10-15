var just = require('./core');
var eachProperty = require('./internals/eachProperty');

module.exports = just.register({'eachProperty': eachProperty}).eachProperty;
