var test = require('tape'),
	flattenKeyValueObject = require('../../src/lib/flattenKeyValueObject');

test('lib/flattenKeyValueObject.js', function (t) {

	t.test('Should flatten a key-value object.', function (st) {

		var keyValueObject = {'a': {'b': 1}};

		st.deepEquals(flattenKeyValueObject(keyValueObject), {
			'a.b': 1
		}, 'The object got merged.');

		st.end();

	});

	t.test('Should throw if the passed value is not a key-value ' +
		'object.', function (st) {

		st.plan(1);

		st.throws(function () {

			flattenKeyValueObject([]);

		}, TypeError, '`[]` is not a key-value object.');

	});

	t.test('Should change the default property separator.', function (st) {
	
		st.deepEquals(flattenKeyValueObject({'a': {'b': 1}}, {
			'separator': '/'
		}), {'a/b': 1}, 'The separator changed.');

		st.end();

	});

	t.end();

});