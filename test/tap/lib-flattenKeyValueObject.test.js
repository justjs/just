var test = require('tap').test,
	flattenKeyValueObject = require('../../src/lib/flattenKeyValueObject');

test('lib/flattenKeyValueObject', {'autoend': true}, function (t) {

	t.test('Should flatten a key-value object.', function (st) {

		var keyValueObject = {'a': {'b': 1}};

		st.deepEquals(flattenKeyValueObject(keyValueObject), {
			'a.b': 1
		}, 'The object got merged.');

		st.end();

	});

	t.test('Should throw if the passed value is not a key-value ' +
		'object.', function (st) {

		st.throws(function () {

			flattenKeyValueObject([]);

		}, TypeError, '`[]` is not a key-value object.');

		st.end();

	});

	t.test('Should change the default property separator.', function (st) {

		flattenKeyValueObject.PROPERTY_SEPARATOR = '/';
	
		st.deepEquals(flattenKeyValueObject({
			'a': {
				'b': 1
			}
		}), {'a/b': 1}, 'The separator changed.');

		st.end();

	});

});