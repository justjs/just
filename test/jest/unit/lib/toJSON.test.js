var toJSON = require('@lib/toJSON');
var parseJSON = require('@lib/parseJSON');

describe('@lib/toJSON.js', function () {

    it('Should be an alias of parseJSON.', function () {

        expect(toJSON).toBe(parseJSON);

    });

});
