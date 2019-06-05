var test = require('tape'),
	access = require('../../src/lib/access');

test('lib/access.js', function (t) {

	t.test('Should work as expected and access to a deep existent ' +
		'property.', function (st) {

		var expectedValue = 'expected';
		var baseObject = {'a': {'b': {'c': {'d': expectedValue}}}};
		var keys = ['a', 'b', 'c', 'd'];
		var mutate = false;
		var result = access(baseObject, keys,
			function (lastObject, lastKey, exists, path) {
	
			st.is(/^(a|b|c|d)$/.test(lastKey), true,
				'`lastKey` is one of the deep keys found.');

			st.is(exists, true, 'The property exists.');			
			
			st.is(path, keys, '`path` includes the given `keys`.');

			return (exists
				? lastObject[lastKey]
				: null
			);

		}, false);

		st.is(result, expectedValue, 'The function accessed ' +
			'a deep property and returned his value.');

		st.end();

	});

	t.test('Should throw if some property doesn\'t hold a key-' +
		'value object as a value and you try to access to it.',
		function (st) {
		
		st.throws(function () {
			access({'a': 1}, ['a', 'b', 'c']);
		}, TypeError, 'The object contains a property ("a") that ' +
			'doesn\'t have a key-value object as a value (1).');

		st.end();

	});

	t.test('Should create and access to some non-existent ' +
		'properties.', function (st) {
		
		var object = Object.assign({'z': 1}, {
			'prototype': Function.prototype
		});
		var keys = ['a', 'b', 'c'];
		var mutate = false;
		var newObject = access(object, keys,
			function (lastObject, lastKey, exists, path) {

			st.isNot(this, object, 'The object didn\'t mutate ' +
				'since `mutate` was a falsy value.');
			
			st.deepEquals(lastObject, {}, 'Keys with undefined ' +
				'values weren\'t added.');

			st.is(lastKey, 'c', 'The handler is called one time ' +
				'(at the end).');

			st.is(exists, false, 'Some property doesn\'t ' +
				'exist.');

			if (!exists) {
				lastObject[lastKey] = path.length;
			}

			return this;

		}, mutate);

		st.deepEquals(newObject, Object.assign(object, {
			'a': {'b': {'c': 3}}
		}), 'The result contains the new keys.');

		st.end();

	});

	t.test('Should modify the base object.', function (st) {

		var mutate = true;
		var object = {'a': {'b': false}, 'b': {'b': false}};
		var keys = 'a.b'.split('.');
		var result = access(object, keys,
			function (lastObject, lastKey) {
		
			lastObject[lastKey] = true;
		
			return this;
		
		}, mutate);

		st.deepEquals(object, {'a': {'b': true}, 'b': {'b': false}},
			'The base object was modified since `mutate` ' +
			'was a truthy value.');

		st.is(result, object, 'It used the same object.');

		st.end();

	});

	t.test('Should return the accessed value if no handler ' +
		'is given.', function (st) {

		var expectedValue = 'expected';
		var object = {'a': {'b': expectedValue}};
		var keys = ['a', 'b'];

		st.is(access(object, keys), expectedValue, 'The last ' +
			'property value was returned.');

		st.end();

	});

});