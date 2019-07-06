var test = require('tape'),
	server = require('../../src/server');

test('/server.js', function (t) {

	t.deepEquals(server, {});
	t.end();

});