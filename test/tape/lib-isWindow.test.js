var test = require('tape'),
	isWindow = require('../../src/lib/isWindow');

test('lib/isWindow.js', function (t) {

	t.test('Should return `true` if the given value is a `window` ' +
		'object.', function (st) {
		
		st.true(isWindow(window));
		st.end();

	});

	t.test('Should return `true` if the given value looks like ' +
		'a `window` object.', function (st) {
		
		st.true(isWindow({
			'setInterval': window.setInterval,
			'document': window.document,
			'some other key': true
		}), 'Since `setInterval` and `document` evaluate to true, ' +
			'the value is considered a `window` object.');

		st.end();

	});

	t.test('Should return `false` if the given value is not ' +
		'an object that looks like a `window` object.',
		function (st) {

		var windowClone = Object.assign({}, window);
		
		st.false(isWindow({
			'setInterval': false,
			'document': true
		}), '`setInterval` is `false`.');
		
		st.false(isWindow({
			'setInterval': true,
			'document': false
		}), '`document` is `false`.');
		
		st.false(isWindow({
			'setInterval': '',
			'document': document
		}), '`setInterval` evaluates to `false`.');

		st.false(isWindow({
			'setInterval': window.setInterval,
			'document': null
		}), '`document` evaluates to `false`.');

		delete windowClone.setInterval;

		st.false(isWindow(windowClone), '`window` no longer has ' +
			'`setInterval`, so is not a `window` object.');

		st.end();

	});

});