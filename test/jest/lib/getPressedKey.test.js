var getPressedKey = require('@src/lib/getPressedKey');

describe('@src/lib/getPressedKey.js', function () {

    it('Should get one of the supported variants for a key ' +
		'when a keyboard event is fired.', function () {

        /** Doesn't matter if it's not an Event. */
        expect(getPressedKey({'key': 'Enter'}) + '').toMatch(/^(Enter|13)$/);

    });

});
