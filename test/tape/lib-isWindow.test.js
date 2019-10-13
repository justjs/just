var test = require('tape');
var isWindow = require('../../src/lib/isWindow');
var options = {'skip': typeof window === 'undefined'};

test('lib/isWindow.js', options, function (t) {

    t.test('Should return `true` if the given value is a `window` ' +
		'object.', function (st) {

        st.is(isWindow(window), true);
        st.end();

    });

    t.test('Should return `true` if the given value looks like ' +
		'a `window` object.', function (st) {

        st.is(isWindow({
            'setInterval': window.setInterval,
            'document': window.document,
            'some other key': true
        }), true, 'Since `setInterval` and `document` evaluate ' +
			'to true, the value is considered a `window` object.');

        st.end();

    });

    t.test('Should return `false` if the given value is not ' +
		'an object that looks like a `window` object.', function (st) {

        st.is(isWindow({
            'setInterval': false,
            'document': true
        }), false, '`setInterval` is `false`.');

        st.is(isWindow({
            'setInterval': true,
            'document': false
        }), false, '`document` is `false`.');

        st.is(isWindow({
            'setInterval': '',
            'document': document
        }), false, '`setInterval` evaluates to `false`.');

        st.is(isWindow({
            'setInterval': window.setInterval,
            'document': null
        }), false, '`document` evaluates to `false`.');

        st.end();

    });

    t.end();

});
