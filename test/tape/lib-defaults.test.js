var test = require('tape'),
	defaults = require('../../src/lib/defaults');

test('defaults', function (t) {

	t.test('should return the given value if it looks like the default value or the default value otherwise', function (st) {

		st.deepEquals(defaults([1, 2], {'a': 1}), {'a': 1}, 'defaults an `Array` to a "key-value object"');
		
		st.deepEquals(defaults({}, null), {}, 'null is an `object`');
		st.deepEquals(defaults([], null), [], 'null is an `object`');
		
		st.deepEquals(defaults(null, {}), {}, 'null is not a "key-value object"');
		st.deepEquals(defaults(null, []), [], 'null is not an `Array`');

		st.is(defaults(1, NaN), 1, '`NaN` is an instance of a `Number`');

		st.end();

	});

	t.test('should "default" the main keys to the default keys', function (st) {

		var ignoreDefaultKeys = true;

		st.deepEquals(
			defaults({'a': 1, 'b': 2}, {'a': 'some string'}, ignoreDefaultKeys),
			{'a': 'some string', 'b': 2},
			'keys get overriden because a deep check was performed (although `ignoreDefaultKeys` was `true`)'
		);

		st.end();

	});

	t.test('should add the default keys to the main object', function (st) {

		var mainObject = {'a': 1};
		var defaultObject = {'b': 2};

		st.deepEquals(
			defaults(mainObject, defaultObject, false),
			Object.assign({}, mainObject, defaultObject)
		);

	});

	t.test('should ignore new keys', function (st) {

		var mainObject = {'a': 1};
		var defaultObject = {'b': 2};

		st.deepEquals(
			defaults(mainObject, defaultObject, true),
			mainObject
		);

		st.end();

	});

});