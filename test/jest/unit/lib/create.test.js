var create = require('@lib/create');
var createElement = require('@lib/createElement');

describe('@lib/create.js', function () {

    it('Should be an alias for createElement.', function () {

        expect(create).toBe(createElement);

    });

});
