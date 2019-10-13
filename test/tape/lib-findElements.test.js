var test = require('tape');
var findElements = require('../../src/lib/findElements');
var options = {'skip': typeof window === 'undefined'};

test('lib/findElements.js', options, function (t) {

    t.test('Should always return an Array.', function (st) {

        st.is(Array.isArray(findElements('body')), true);
        st.is(Array.isArray(findElements('notFound')), true);

        st.end();

    });

    t.end();

});
