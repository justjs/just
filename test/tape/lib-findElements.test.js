var test = require('tape'),
	findElements = require('../../src/lib/findElements');

test('lib/findElements.js', function (t) {

	t.test('Should always return an Array.', function (st) {

		st.is(Array.isArray(findElements('body')), true);
		st.is(Array.isArray(findElements('notFound')), true);

		st.end();

	});

	t.end();

});