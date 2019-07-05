var test = require('tape'),
	toKeyValueObject = require('../../src/lib/toKeyValueObject');

test('lib/toKeyValueObject.js', function (t) {

	t.test('Should convert null, key-value objects and arrays and ' +
		'return a new object, and throw with malformed values.',
		function (st) {

		st.plan(8);

		st.doesNotThrow(function () {
			st.deepEquals(toKeyValueObject([]), {});
		}, TypeError, 'Empty arrays return empty key-value objects.');

		st.throws(function () {
			toKeyValueObject([0, 1]);
		}, TypeError, 'Malformed arrays throw.');

		st.doesNotThrow(function () {
			var keyValueObject = {'a': 1};
			st.isNot(toKeyValueObject(keyValueObject), keyValueObject);
			st.deepEquals(toKeyValueObject(keyValueObject), keyValueObject);
		}, TypeError, 'key-value objects return a new key-value object ' +
			'containing his owned properties.');

		st.doesNotThrow(function () {
			st.deepEquals(toKeyValueObject(null), {});
		}, TypeError, 'null return an empty key-value object.');	

	});

	t.test('Should convert an array of key-value pairs to ' +
		'a key-value object.', function (st) {

		st.deepEquals(toKeyValueObject([['a', 1], ['b', 2]]), {
			'a': 1,
			'b': 2
		}, 'Converts sub-arrays.');

		st.deepEquals(toKeyValueObject([{'a': 1, 'b': 2}, ['c', 3]]), {
			'a': 1,
			'b': 2,
			'c': 3
		}, 'Converts sub-arrays and assigns key-value sub-objects.');

		st.end();

	});

	t.test('Should use the first 2 values of the sub arrays and ' +
		'ignore the other ones.', function (st) {

		st.deepEquals(toKeyValueObject([
			['a', 1, 'ignored', 'ignored too'],
			['b', 2, 'ignored']
		]), {
			'a': 1,
			'b': 2
		});

		st.end();

	});

	t.end();

});