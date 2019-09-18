var test = require('tape');
var server = require('../../src/server');

test('/server.js', function (t) {

    t.deepEquals(server, {});
    t.end();

});
