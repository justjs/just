var test = require('tape'),
	eachProperty = require('@lib/eachProperty');

test('eachProperty', function (t) {

	t.test('should iterate all the owned properties of an object', function (st) {

		var mainObject = {'a': 1, 'b': 2};
		var strict = false;
		var results = eachProperty(mainObject, function (value, key, object) {

			st.is(this, st);
			st.is(object, mainObject);

			return value;

		}, st, strict);

		st.deepEquals(results, mainObject);

		st.end();

	});

	t.test('should iterate the non-owned properties of an object', function (st) {

		var mainObject = Object.assign(function () {}, {
			'prototype': Object.prototype
		});
		var strict = true;
		var wasNonOwnedPropertyFound;

		eachProperty(mainObject, function (value, key, object) {

			st.is(this, st);
			st.is(object, mainObject);

			if (!object.hasOwnProperty(key)) {
				wasNonOwnedPropertyFound = true;
			}

		}, st, strict);

		if (!wasNonOwnedPropertyFound) {
			return st.fail();
		}

		st.pass();

	});

});