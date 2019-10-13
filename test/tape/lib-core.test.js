var test = require('tape');
var core = require('../../src/lib/core');

test('lib/core.js', function (t) {

    t.test('Should contain a version', function (st) {

        st.is('version' in core, true);
        st.end();

    });

    t.end();

});
