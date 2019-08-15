var test = require('tape'),
	browser = require('../../src/browser')

test('/browser.js', function (t) {

	t.deepEquals(browser, {});
	t.end();

});