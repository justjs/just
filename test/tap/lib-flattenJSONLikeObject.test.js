var test = require('tap').test,
	flattenJSONLikeObject = require('../../src/lib/flattenJSONLikeObject'),
	flattenKeyValueObject = require('../../src/lib/flattenKeyValueObject');

test('lib/flattenJSONLikeObject', {'autoend': true}, function (t) {

	t.test('Should be an alias of `flattenKeyValueObject`.',
		function (st) {

		st.is(flattenJSONLikeObject, flattenKeyValueObject);

		st.end();

	});

});