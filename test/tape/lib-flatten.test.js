var test = require('tape'),
	flatten = require('../../src/lib/flatten'),
	flattenArray = require('../../src/lib/flattenArray'),
	flattenKeyValueObject = require('../../src/lib/flattenKeyValueObject');

test('lib/flatten.js', function (t) {

	t.test('Should generate a result depending on the type of the ' +
		'given value.', function (st) {

		var array = [0, [1, [2]]];
		var keyValueObject = {'a': {'b': {'c': 'd'}}};

		st.deepEquals(flatten(array), flattenArray(array));
		st.deepEquals(flatten(keyValueObject), flattenKeyValueObject(keyValueObject));

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