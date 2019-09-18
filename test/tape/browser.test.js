var test = require('tape');
var browser = require('../../src/browser');

test('/browser.js', function (t) {

    t.deepEquals(browser, {});
    t.end();

});
