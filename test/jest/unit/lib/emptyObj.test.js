var emptyObj = require('@lib/emptyObj');
var isEmptyObject = require('@lib/isEmptyObject');

describe('@lib/emptyObj.js', function () {

    it('Should be an alias of isEmptyObject.', function () {

        expect(emptyObj).toBe(isEmptyObject);

    });

});
