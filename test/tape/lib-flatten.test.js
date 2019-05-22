var test = require('tape'),
	flatten = require('../../src/lib/flatten');

test('lib/flatten.js', function (t) {

	t.test('should flatten an array', function (st) {
		st.deepEquals(flatten([0, [1, [2]]]), [0, 1, 2]);
		st.end();
	});

	t.test('should create an Array with a non-array object as a value and flatten it', function (st) {
		
		var arrayLike = {'0': ['a', ['b', ['c']]], 'length': 1};
		var notAnArray = null;

		st.deepEquals(flatten(arrayLike), [arrayLike]);
		
		st.deepEquals(
			flatten(Array.from(arrayLike)),
			['a', 'b', 'c'],
			'array-like values need to be converted manually'
		);

		st.deepEquals(flatten(notAnArray), [notAnArray]);

		st.end();

	});

	t.test('should flatten until a certain deep-level', function (st) {

		var array = [0, [1, [2, [3]]]];

		st.deepEquals(flatten(array, -1), [0, 1, 2, 3], 'negative values are ignored');
		st.deepEquals(flatten(array, 2), [0, 1, 2, [3]], 'values are inclusive');
		st.deepEquals(flatten(array, 0), array, '0 returns the same');

		st.end();

	});

});