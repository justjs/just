var test = require('tape'),
	flatten = require('../../src/lib/flatten'),
	flattenArray = require('../../src/lib/flattenArray'),
	flattenKeyValueObject = require('../../src/lib/flattenKeyValueObject');

test('lib/flatten.js', function (t) {

	t.test('Should generate a result depending on the type of the ' +
		'given value.', function (st) {

		st.deepEquals(flatten([]), [],
			'flattenArray returns an Array.');
		
		st.deepEquals(flatten({}), {},
			'flattenKeyValueObject returns a key-value object.');

		st.end();

	});

	t.test('Should throw if the solution is not implemented.',
		function (st) {

		st.throws(function () {
			flatten('string');
		}, TypeError, '`flattenString` or something similar is not ' +
			'implemented yet.');

		st.end();

	});

});