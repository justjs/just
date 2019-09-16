var test = require('tape'),
	flattenObjectLiteral = require('../../src/lib/flattenObjectLiteral');

test('lib/flattenObjectLiteral.js', function (t) {

	t.test('Should flatten an object literal.', function (st) {

		var objectLiteral = {'a': {'b': 1}};

		st.deepEquals(flattenObjectLiteral(objectLiteral), {
			'a.b': 1
		}, 'The object got merged.');

		st.end();

	});

	t.test('Should throw if the passed value is not an ' +
		'object literal.', function (st) {

		st.plan(1);

		st.throws(function () {

			flattenObjectLiteral([]);

		}, TypeError, '`[]` is not an object literal.');

	});

	t.test('Should change the default property separator.', function (st) {
	
		st.deepEquals(flattenObjectLiteral({'a': {'b': 1}}, {
			'separator': '/'
		}), {'a/b': 1}, 'The separator changed.');

		st.end();

	});

	t.end();

});