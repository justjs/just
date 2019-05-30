var test = require('tap').test,
	flattenArray = require('../../src/lib/flattenArray');

test('lib/flattenArray.js', {'autoend': true}, function (t) {

	t.test('Should flatten an array.', function (st) {
		st.deepEquals(flattenArray([0, [1, [2]]]), [0, 1, 2]);
		st.end();
	});

	t.test('Should create an Array with a non-array object as ' +
		'a value, and flatten it.', function (st) {
		
		var arrayLike = {'0': ['a', ['b', ['c']]], 'length': 1};
		var notAnArray = null;

		st.deepEquals(flattenArray(arrayLike), [arrayLike]);
		
		st.deepEquals(
			flattenArray(Array.from(arrayLike)),
			['a', 'b', 'c'],
			'array-like values need to be converted manually'
		);

		st.deepEquals(flattenArray(notAnArray), [notAnArray]);

		st.end();

	});

	t.test('Should flatten until a certain deep-level.',
		function (st) {

		var array = [0, [1, [2, [3]]]];

		st.deepEquals(flattenArray(array, -1), [0, 1, 2, 3],
			'negative values are ignored');
		st.deepEquals(flattenArray(array, 2), [0, 1, 2, [3]],
			'values are inclusive');
		st.deepEquals(flattenArray(array, 0), array,
			'0 returns the same');

		st.end();

	});

});