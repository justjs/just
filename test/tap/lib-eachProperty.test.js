var test = require('tap').test,
	eachProperty = require('../../src/lib/eachProperty');

test('lib/eachProperty.js', {'autoend': true}, function (t) {

	t.test('Should iterate all the owned properties of an object.',
		function (st) {

		var mainObject = {'a': 1, 'b': 2};
		var strict = false;
		var results = eachProperty(mainObject,
			function (value, key, object) {

			st.is(this, st);
			st.is(object, mainObject);

			return value;

		}, st, strict);

		st.deepEquals(results, mainObject);

		st.end();

	});

	t.test('Should iterate the non-owned properties of an object.',
		(function () {

		var myObject = {'a': 1};

		function TestObject () {}
		TestObject.prototype = myObject;

		return function (st) {

			var mainObject = new TestObject();
			var strict = true;
			var someInheritedPropertyWasFound = false;

			eachProperty(mainObject, function (value, key, object) {

				st.is(this, st);
				st.is(object, mainObject);

				if (!object.hasOwnProperty(key)) {
					someInheritedPropertyWasFound = true;
				}

			}, st, strict);

			if (!someInheritedPropertyWasFound) {
				return st.fail('No inherited properties were ' +
					'found.');
			}

			st.end();

		};

	})());

});