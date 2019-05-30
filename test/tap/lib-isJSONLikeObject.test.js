var test = require('tap').test,
	isKeyValueObject = require('../../src/lib/isKeyValueObject'),
	isJSONLikeObject = require('../../src/lib/isJSONLikeObject');

test('lib/isJSONLikeObject.js', {'autoend': true}, function (t) {

	t.test('Should be the same as lib/isKeyValueObject.',
		function (st) {
		
		st.is(isJSONLikeObject, isKeyValueObject);
		
		st.end();

	});

});