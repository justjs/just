var test = require('tape'),
	toKeyValueObject = require('../../src/lib/toKeyValueObject');

test('lib/toKeyValueObject.js', function (t) {

	t.test('Should convert an array of key-value pairs to ' +
		'a key-value object.', function (st) {

		st.deepEquals(toKeyValueObject([['a', 1], ['b', 2]]), {
			'a': 1,
			'b': 2
		});

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

	t.test('Should throw if something fails.', function (st) {

		st.throws(function () {
			toKeyValueObject([0, 1]);
		}, TypeError, '0 is not an array');

		st.end();

	});

	t.end();

});