var test = require('tape'),
	stringToJSON = require('../../src/lib/stringToJSON');

test('lib/stringToJSON.js', function (t) {

	t.test('should parse a valid string', function (st) {
		st.deepEquals(stringToJSON('{"a": 1}'), {'a': 1});
		st.end();
	});

	t.test('should return an empty key-value object if something fails', function (st) {
		st.deepEquals(stringToJSON(1), {}, 'not a JSON');
		st.deepEquals(stringToJSON('["a": 1]'), {}, 'malformed JSON');
		st.end();
	});

});