var el = require('@lib/el');
var findElements = require('@lib/findElements');

describe('@lib/el.js', function () {

    it('Should be an alias of findElements.', function () {

        expect(el).toBe(findElements);

    });

});
