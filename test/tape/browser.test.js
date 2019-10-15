var test = require('tape');
var browser = require('../../src/browser');
var options = {'skip': typeof window === 'undefined'};

test('/browser.js', options, function (t) {

    t.deepEquals(browser, {});
    t.end();

});
