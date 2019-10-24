var on = require('@lib/on');
var addEventListener = require('@lib/addEventListener');

describe('@lib/on.js', function () {

    it('Should be an alias of addEventListener.', function () {

        expect(on).toBe(addEventListener);

    });

});
