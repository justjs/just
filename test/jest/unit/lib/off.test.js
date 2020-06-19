var off = require('@lib/off');
var removeEventListener = require('@lib/removeEventListener');

describe('@lib/off.js', function () {

    it('Should be an alias for removeEventListener.', function () {

        expect(off).toBe(removeEventListener);

    });

});
