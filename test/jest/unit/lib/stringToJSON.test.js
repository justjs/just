var stringToJSON = require('@lib/stringToJSON');

describe('@lib/stringToJSON.js', function () {

    it('Should parse a valid string.', function () {

        expect(stringToJSON('{"a": 1}')).toMatchObject({'a': 1});

    });

    it('Should return an empty key-value object if something ' +
		'fails.', function () {

        /** Not a JSON */
        expect(stringToJSON(1)).toMatchObject({});
        /**
         * 'malformed JSON: ' +
         * Keys and string values must be enclosed in double quotes.'
         */
        expect(stringToJSON('{\'a\': \'b\'}')).toMatchObject({});

    });

    it('Should parse line breaks too.', function () {

        expect(stringToJSON('{\n"a": 1\n}')).toMatchObject({'a': 1});

    });

});
