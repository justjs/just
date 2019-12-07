var is = require('@lib/is');
var check = require('@lib/check');

describe('@lib/is.js', function () {

    it('Should be an alias of check.', function () {

        expect(is).toBe(check);

    });

});
