var test = require('tape'),
	isKeyValueObject = require('../../src/lib/isKeyValueObject');

test('lib/isKeyValueObject.js', function (t) {

	t.test('Should return `true` if the given value is in a ' +
		'"JSON format".', function (st) {

		st.is(isKeyValueObject([1, 2]), false);
		st.is(isKeyValueObject({'a': 1}), true);
		st.is(isKeyValueObject("{'a':1}"), false);

		st.end();

	});

	t.test('Should work with cyclic object values.', function (st) {

		var reference = {};
		reference.myself = reference;

		st.is(isKeyValueObject(reference), true);
		st.end();

	});

	t.test('Should never throw an exception.', function (st) {

		var object = {};

		st.plan(2);

		object.toString = null;
		object.cyclic = object;

		st.doesNotThrow(function () {
			st.is(isKeyValueObject(object), true);
		});

	});

});