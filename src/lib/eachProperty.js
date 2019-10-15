var just = require('./core');
var eachProperty = require('./internals/eachProperty');

just.register({'eachProperty': eachProperty});

module.exports = eachProperty;
