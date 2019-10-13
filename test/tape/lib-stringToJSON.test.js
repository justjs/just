var test = require('tape');
var stringToJSON = require('../../src/lib/stringToJSON');
var options = {'skip': typeof window === 'undefined'};

test('lib/stringToJSON.js', options, function (t) {

    t.test('Should parse a valid string.', function (st) {

        st.deepEquals(stringToJSON('{"a": 1}'), {'a': 1});
        st.end();

    });

    t.test('Should return an empty key-value object if something ' +
		'fails.', function (st) {

        st.deepEquals(stringToJSON(1), {}, 'not a JSON');
        st.deepEquals(stringToJSON('{\'a\': \'b\'}'), {}, 'malformed JSON: ' +
			'Keys and string values must be enclosed in double quotes.');
        st.end();

    });

    t.end();

});
