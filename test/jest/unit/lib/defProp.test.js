var defProp = require('@lib/defProp');
var defineProperty = require('@lib/defineProperty');

describe('@lib/defProp.js', function () {

    it('Should be an alias of defineProperty.', function () {

        expect(defProp).toBe(defineProperty);

    });

});
