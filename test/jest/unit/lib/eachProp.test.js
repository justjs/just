var eachProp = require('@lib/eachProp');
var eachProperty = require('@lib/eachProperty');

describe('@lib/eachProp.js', function () {

    it('Should be an alias of eachProperty.', function () {

        expect(eachProp).toBe(eachProperty);

    });

});
