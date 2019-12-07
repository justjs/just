var supportsTouch = require('@lib/supportsTouch');
var isTouchSupported = require('@lib/isTouchSupported');

describe('@lib/supportsTouch.js', function () {

    it('Should be an alias of isTouchSupported.', function () {

        expect(supportsTouch).toBe(isTouchSupported);

    });

});
