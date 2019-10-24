var toJSON = require('@lib/toJSON');
var stringToJSON = require('@lib/stringToJSON');

describe('@lib/toJSON.js', function () {

    it('Should be an alias of stringToJSON.', function () {

        expect(toJSON).toBe(stringToJSON);

    });

});
