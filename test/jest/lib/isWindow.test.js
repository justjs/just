var isWindow = require('@lib/isWindow');

describe('@lib/isWindow.js', function () {

    it('Should return `true` if the given value is a `window` ' +
		'object.', function () {

        expect(isWindow(window)).toBe(true);

    });

    it('Should return `true` if the given value looks like ' +
		'a `window` object.', function () {

        /**
         * Since `setInterval` and `document` evaluate
         * to true, the value is considered a `window` object.
         */
        expect(isWindow({
            'setInterval': window.setInterval,
            'document': window.document,
            'some other key': true
        })).toBe(true);

    });

    it('Should return `false` if the given value is not ' +
		'an object that looks like a `window` object.', function () {

        /** `setInterval` is `false`. */
        expect(isWindow({
            'setInterval': false,
            'document': true
        })).toBe(false);

        /** `document` is `false`. */
        expect(isWindow({
            'setInterval': true,
            'document': false
        })).toBe(false);

        /** `setInterval` evaluates to `false`. */
        expect(isWindow({
            'setInterval': '',
            'document': document
        })).toBe(false);

        /** `document` evaluates to `false`. */
        expect(isWindow({
            'setInterval': window.setInterval,
            'document': null
        })).toBe(false);

    });

});
