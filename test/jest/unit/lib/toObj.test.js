var toObj = require('@lib/toObj');
var toObjectLiteral = require('@lib/toObjectLiteral');

describe('@lib/toObj.js', function () {

    it('Should be an alias of toObjectLiteral.', function () {

        expect(toObj).toBe(toObjectLiteral);

    });

});
