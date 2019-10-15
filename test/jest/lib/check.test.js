var check = require('@src/lib/check');

describe('@src/lib/check.js', function () {

    it('Should check if the given value looks like the others.', function () {

        expect(check({}, null, [], function () {})).toBe(false); // Neither is `{}`.
        expect(check({}, null, [], {})).toBe(true); // Last value is `{}`.
        expect(check(null, {}, [], 'null')).toBe(false); // Neither is `null`.
        expect(check(null, null)).toBe(true); // 'Both are `null`.
        expect(check(void 0, undefined)).toBe(true); // 'Both are `undefined`.
        expect(check(1, NaN)).toBe(true); // 'Both are Numbers.
        expect(check(function () {}, Object)).toBe(true); // 'Both are Functions.
        expect(check({'a': 1}, 0, 0, 0, {})).toBe(true); // 'Last value is `{}`.

    });

    it('Should return false if the function is called with less ' +
		'than 2 values.', function () {

        expect(check()).toBe(false);
        expect(check(1)).toBe(false);
        expect(check(void 0)).toBe(false);

    });

    it('Should throw when the given value does not "check" ' +
		'against other values.', function () {

        var customMessage = 'The given value didn\'t matched.';

        expect(function () {

            /** None matches, so it'll throw a custom message */
            check.throwable.call(customMessage, [], 0, {}, null);

        }).toThrow(customMessage);

        expect(function () {

            /** If `this` is not given, a default message will be used. */
            check.throwable([], 0, {}, '[]');

        }).toThrow(TypeError);

        expect(function () {

            /** The function returned the base value instead of throwing. */
            expect(check.throwable(0, 5), 0, 'The first value is returned.');

        }).not.toThrow(TypeError);

    });

});
