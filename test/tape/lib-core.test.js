var test = require('tape');
var core = require('../../src/lib/core');

test('lib/core.js', function (t) {

    t.test('Should contain a version', function (st) {

        st.is('version' in core, true);
        st.end();

    });

    t.test('Should register multiple members', function (st) {

        st.is(core.register({
            'a': 1,
            'b': {'value': 2},
            'c': {'configurable': true}
        }), core);

        st.is(core.a, 1);
        st.is(core.b, 2);
        st.is(core.c, void 0);

        st.end();

    });

    t.end();

});
