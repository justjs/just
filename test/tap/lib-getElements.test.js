var test = require('tap').test,
	getElements = require('../../src/lib/getElements');

test('lib/getElements.js', {'autoend': true}, function (t) {

	t.test('Should always return an Array.', function (st) {

		st.is(Array.isArray(getElements('body')), true);
		st.is(Array.isArray(getElements('notFound')), true);

		st.end();

	});

});