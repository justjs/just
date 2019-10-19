var getPressedKey = require('@lib/getPressedKey');

describe('@lib/getPressedKey.js', function () {

    it('Should get one of the supported variants for a key ' +
        'when a keyboard event is fired.', function () {

        /** Doesn't matter if it's not an Event. */
        expect(getPressedKey({'key': 'Enter'}) + '').toBe('Enter');
        expect(getPressedKey({'which': 13})).toBe(13);
        expect(getPressedKey({'keyCode': 13})).toBe(13);

    });

    it('Should return the most recent implementation first.', function () {

        expect(getPressedKey({
            'key': 'key',
            'which': 'which',
            'keyCode': 'keyCode'
        })).toBe('key');

        expect(getPressedKey({
            'which': 'which',
            'keyCode': 'keyCode'
        })).toBe('which');

        expect(getPressedKey({
            'none-supported': true
        })).toBe(void 0);

    });

});
