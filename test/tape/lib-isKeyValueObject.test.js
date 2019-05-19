var test = require('tape'),
	isKeyValueObject = require('../../src/lib/isKeyValueObject');

test('isKeyValueObject', function (t) {

	t.test('should return `true` if the given value is in a "JSON format"', function (st) {

		st.is(isKeyValueObject([1, 2]), false);
		st.is(isKeyValueObject({'a': 1}), true);
		st.is(isKeyValueObject("{'a':1}"), false);

		st.end();

	});

});