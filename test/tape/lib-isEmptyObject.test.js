var test = require('tape'),
	isEmptyObject = require('../../src/lib/isEmptyObject');

test('lib/isEmptyObject.js', function (t) {

	t.test('Should return `true` if it\'s an empty object.',
		function (st) {

		st.is(isEmptyObject({}), true);
		st.is(isEmptyObject(null), true);
		st.is(isEmptyObject(1), true, 'Values get converted into ' +
			'objects by using the Object constructor.');

		st.end();

	});

	t.test('Should return `false` if it\'s not an empty object.', function (st) {
		st.is(isEmptyObject({'a': 1}), false);
		st.is(isEmptyObject(['a']), false);
		st.end();
	});

	t.end();

});