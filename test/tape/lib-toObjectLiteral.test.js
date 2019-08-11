var test = require('tape'),
	toObjectLiteral = require('../../src/lib/toObjectLiteral');

test('lib/toObjectLiteral.js', function (t) {

	t.test('Should convert null, object literals and arrays and ' +
		'return a new object, and throw with malformed values.',
		function (st) {

		st.plan(8);

		st.doesNotThrow(function () {
			st.deepEquals(toObjectLiteral([]), {});
		}, TypeError, 'Empty arrays return empty object literals.');

		st.throws(function () {
			toObjectLiteral([0, 1]);
		}, TypeError, 'Malformed arrays throw.');

		st.doesNotThrow(function () {
			var keyValueObject = {'a': 1};
			st.isNot(toObjectLiteral(keyValueObject), keyValueObject);
			st.deepEquals(toObjectLiteral(keyValueObject), keyValueObject);
		}, TypeError, 'object literals return a new object literal ' +
			'containing his owned properties.');

		st.doesNotThrow(function () {
			st.deepEquals(toObjectLiteral(null), {});
		}, TypeError, 'null return an empty object literal.');	

	});

	t.test('Should convert an array of object literal pairs to ' +
		'an object literal.', function (st) {

		st.deepEquals(toObjectLiteral([['a', 1], ['b', 2]]), {
			'a': 1,
			'b': 2
		}, 'Converts sub-arrays.');

		st.deepEquals(toObjectLiteral([{'a': 1, 'b': 2}, ['c', 3]]), {
			'a': 1,
			'b': 2,
			'c': 3
		}, 'Converts sub-arrays and assigns object literal sub-objects.');

		st.end();

	});

	t.test('Should use the first 2 values of the sub arrays and ' +
		'ignore the other ones.', function (st) {

		st.deepEquals(toObjectLiteral([
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