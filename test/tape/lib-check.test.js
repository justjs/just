var test = require('tape'),
	check = require('../../src/lib/check');

test('lib/check.js', function (t) {

	t.test('Should check if the given value looks like the others.',
		function (st) {

		st.is(check({}, null, [], function () {}), false,
			'Neither is `{}`.');

		st.is(check({}, null, [], {}), true,
			'Last value is `{}`');

		st.is(check(null, {}, [], 'null'), false,
			'Neither is `null`.');

		st.is(check(null, null), true,
			'Both are `null`.');

		st.is(check(void 0, undefined), true,
			'Both are `undefined`.');

		st.is(check(1, NaN), true,
			'Both are Numbers.');

		st.is(check(function () {}, Object), true,
			'Both are Functions.');

		st.is(check({'a': 1}, 0, 0, 0, {}), true,
			'Last value is `{}`.');

		st.end();

	});

	t.test('Should return false if the function is called with less ' +
		'than 2 values.', function (st) {

		st.is(check(), false);
		st.is(check(1), false);
		st.is(check(void 0), false);

		st.end();

	});

	t.test('Should throw when the given value does not "check" ' +
		'against other values.', function (st) {

		var customMessage = 'The given value didn\'t matched.';
	
		st.plan(4);

		st.throws(function () {

			check.throwable.call(customMessage, [], 0, {}, null);

		}, customMessage, 'None matched, so it threw a custom message.');

		st.throws(function () {

			check.throwable([], 0, {}, '[]');

		}, TypeError, 'If `this` is not given, a default message ' +
			'will be used.');

		st.doesNotThrow(function () {

			st.is(check.throwable(0, 5), 0,
				'The first value is returned.');

		}, TypeError, 'The function returned the base value ' +
			'instead of throw.');

	});

	t.end();

});