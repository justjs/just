var test = require('tape');
var isTouchDevice = require('../../src/lib/isTouchDevice');
var options = {'skip': typeof window === 'undefined'};

test('lib/isTouchDevice.js', options, function (t) {

    t.test('Should check for touch support.', function (st) {

        var isTouchSupported = isTouchDevice();

        st.is(typeof isTouchSupported, 'boolean');

        st.end();

    });

    t.end();

});
