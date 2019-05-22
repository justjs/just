var test = require('tape'),
	isEmptyObject = require('../../src/lib/isEmptyObject');

test('lib/isEmptyObject.js', function (t) {

	t.test('should return `true` if it\'s an empty object', function (st) {

		st.false(isEmptyObject({'a': 1}));
		st.false(isEmptyObject(['a', 'b']));

		st.true(isEmptyObject({}));
		st.true(isEmptyObject(null));
		st.true(isEmptyObject(1), 'Values get converted into objects using the Object constructor');

		st.end();

	});

});