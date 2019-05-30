var test = require('tape'),
	isKeyValueObject = require('../../src/lib/isKeyValueObject');

test('lib/isKeyValueObject.js', function (t) {

	t.test('Should return `true` if the given value is in a ' +
		'"JSON format".', function (st) {

		st.false(isKeyValueObject([1, 2]));
		st.true(isKeyValueObject({'a': 1}));
		st.false(isKeyValueObject("{'a':1}"));

		st.end();

	});

	t.test('Should work with cyclic object values.', function (st) {

		var reference = {};
		reference.myself = reference;

		st.true(isKeyValueObject(reference));
		st.end();

	});

	t.test('Should never throw an exception.', function (st) {

		var object = {};

		st.plan(2);

		object.toString = null;
		object.cyclic = object;

		st.doesNotThrow(function () {
			st.true(isKeyValueObject(object));
		});

	});

});