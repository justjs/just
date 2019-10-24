var prop = require('@lib/prop');
var access = require('@lib/access');

describe('@lib/prop.js', function () {

    it('Should be an alias of access.', function () {

        expect(prop).toBe(access);

    });

});
