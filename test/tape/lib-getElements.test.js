var test = require('tape'),
	getElements = require('../../src/lib/getElements');

test('lib/getElements.js', function (t) {

	t.test('Should always return an Array.', function (st) {

		st.true(Array.isArray(getElements('body')));
		st.true(Array.isArray(getElements('notFound')));

		st.end();

	});

});