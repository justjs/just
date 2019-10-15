var eachProperty = require('./eachProperty');
var defineProperty = require('./defineProperty');
var defineProperties = require('./defineProperties');

module.exports = function (store) {

    var register = function register (members) {

        eachProperty(members, function (value, name) {

            var values = Array.isArray(value) ? value : [value];
            var member = values[0];
            var properties = values[1] || {};
            var prototype = values[2] || {};

            defineProperties(defineProperties(member, properties).prototype, prototype);
            defineProperty(store, name, member);

        });

        return store;

    };

    return register;

};
