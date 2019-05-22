var test = require('tape'),
	access = require('../../src/lib/access');

test('lib/access.js', function (t) {

	t.test('should access to a deep existent property', function (st) {

		var baseObject = {'a': {'b': {'c': {'d': 4}}}};
		var keys = ['a', 'b', 'c', 'd'];
		var mutate = false;
		var result = access(baseObject, keys, function (currentObject, currentKey, propertyExists, path) {
	
			st.true(/^(a|b|c|d)$/.test(currentKey));
			st.true(propertyExists);
			st.is(path, keys);

			return (propertyExists ? currentObject[currentKey] : null);

		}, false);

		st.is(result, 4);

		st.end();

	});

	t.test('should throw when trying to access to a key that doesn\'t hold a key-value object as a value', function (st) {
		
		st.plan(1);
		st.throws(function () {
			access({'a': 1}, ['a', 'b', 'c']);
		}, TypeError);

	});

	t.test('should create and access to some non-existent properties', function (st) {
		
		var object = Object.assign({'z': 1}, {
			'prototype': Function.prototype
		});
		var keys = ['a', 'b', 'c'];
		var mutate = false;
		var newObject = access(object, keys, function (currentObject, currentKey, propertyExists, path) {

			st.isNot(this, object, '`mutate` is false');
			st.deepEquals(currentObject, {}, 'Keys with undefined values won\'t be added');
			st.is(currentKey, 'c', 'The handler is called at the end');
			st.false(propertyExists);
			st.deepEquals(path, keys);

			if (!propertyExists) {
				currentObject[currentKey] = path.length;
			}

			return this;

		}, mutate);

		st.deepEquals(newObject, Object.assign(object, {'a': {'b': {'c': 3}}}));

		st.end();

	});

	t.test('should modify the base object', function (st) {

		var mutate = true;
		var object = {'a': {'b': false}, 'b': {'b': false}};
		var keys = 'a.b'.split('.');
		var result = access(object, keys, function (currentObject, currentKey, propertyExists, path) {
			currentObject[currentKey] = true;
			return this;
		}, mutate);

		st.deepEquals(object, {'a': {'b': true}, 'b': {'b': false}});
		st.is(result, object);

		st.end();

	});

	t.test('should return the accessed value if no handler is given', function (st) {

		var object = {'a': {'b': 'value'}};
		var keys = ['a', 'b'];

		st.is(access(object, keys), 'value');

		st.end();

	});

});