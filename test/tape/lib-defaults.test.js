var test = require('tape'),
	defaults = require('../../src/lib/defaults');

test('lib/defaults.js', function (t) {

	t.test('Should return the given value if it looks like ' +
		'the default value, or the default value otherwise.',
		function (st) {

		st.deepEquals(defaults([1, 2], {'a': 1}), {'a': 1},
			'Defaults an `Array` to a "key-value object".');
		
		st.deepEquals(defaults({}, null), {},
			'`null` is an `object`.');
		st.deepEquals(defaults([], null), [],
			'`null` is an `object`.');
		
		st.deepEquals(defaults(null, {}), {},
			'`null` is not a "key-value object".');
		st.deepEquals(defaults(null, []), [],
			'`null` is not an `Array`.');

		st.is(defaults(1, NaN), 1,
			'`NaN` is an instance of a `Number`.');

		st.end();

	});

	t.test('Should "default" the main keys to the default keys.',
		function (st) {

		var ignoreDefaultKeys = true;

		st.deepEquals(
			defaults({'a': 1, 'b': 2}, {'a': ''}, ignoreDefaultKeys),
			{'a': '', 'b': 2},
			'Keys got overriden because a deep check was performed ' +
			'(although `ignoreDefaultKeys` was a truthy value).'
		);

		st.end();

	});

	t.test('Should add the default keys to the main object.',
		function (st) {

		var mainObject = {'a': 1};
		var defaultObject = {'b': 2};

		st.deepEquals(
			defaults(mainObject, defaultObject, false),
			Object.assign({}, mainObject, defaultObject)
		);

		st.end();

	});

	t.test('Should ignore new keys.', function (st) {

		var mainObject = {'a': 1};
		var defaultObject = {'b': 2};

		st.deepEquals(
			defaults(mainObject, defaultObject, true),
			mainObject
		);

		st.end();

	});

});