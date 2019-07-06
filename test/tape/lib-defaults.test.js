var test = require('tape'),
	defaults = require('../../src/lib/defaults');

test('lib/defaults.js', function (t) {

	t.test('Should return the given value if it looks like ' +
		'the default value, or the default value otherwise.',
		function (st) {

		st.deepEquals(defaults([1, 2], {'a': 1}), {'a': 1},
			'Defaults an `Array` to a "key-value object".');
		
		st.deepEquals(
			defaults({}, null),
			null,
			'a "key-value" object is not `null`.'
		);

		st.deepEquals(
			defaults([], null, {'checkLooks': false}),
			[],
			'`null` is an `object`.'
		);
		
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

		st.deepEquals(
			defaults({'a': 1, 'b': 2}, {'a': ''}, {
				'ignoreDefaultKeys': true,
				'checkLooks': true,
				'checkDeepLooks': true
			}),
			{'a': '', 'b': 2},
			'Keys got overriden because a deep check was performed ' +
			'(although `ignoreDefaultKeys` was `true`).'
		);

		st.end();

	});

	t.test('Should add the default keys to the main object.',
		function (st) {

		var mainObject = {'a': 1};
		var defaultObject = {'b': 2};

		st.deepEquals(
			defaults(mainObject, defaultObject, {
				'ignoreDefaultKeys': false
			}),
			Object.assign({}, mainObject, defaultObject)
		);

		st.end();

	});

	t.test('Should ignore new keys.', function (st) {

		var mainObject = {'a': 1};
		var defaultObject = {'b': 2};

		st.deepEquals(
			defaults(mainObject, defaultObject, {
				'ignoreDefaultKeys': true
			}),
			mainObject
		);

		st.end();

	});

	t.test('Should check objects by his type instead of his look.',
		function (st) {

		st.deepEquals(defaults(null, {'a': null}, {
			'checkLooks': false
		}), null, '`null` is accepted because `{}` is an object too.');

		st.deepEquals(defaults(null, {'a': null}, {
			'checkDeepLooks': false
		}), {'a': null}, '`null` is discarded because `null` !== {}');

		st.deepEquals(defaults({'a': []}, {'a': null}, {
			'checkDeepLooks': false
		}), {'a': []}, '`[]` is accepted because `null` is an object too.');

		st.deepEquals(defaults(null, {'a': null}, {
			'checkLooks': false,
			'checkDeepLooks': false
		}), null, '`checkDeepLooks` is useless when `checkLooks` is `false`.');

		st.end();

	});

	t.end();

});