var isEmptyObject = require('@lib/isEmptyObject');

describe('@lib/isEmptyObject.js', function () {

    it('Should return `true` if it\'s an empty object.', function () {

        expect(isEmptyObject({})).toBe(true);
        expect(isEmptyObject(null)).toBe(true);
        /** Values get converted into objects by using the Object constructor. */
        expect(isEmptyObject(1)).toBe(true);

    });

    it('Should return `false` if it\'s not an empty object.', function () {

        expect(isEmptyObject({'a': 1})).toBe(false);
        expect(isEmptyObject(['a'])).toBe(false);

    });

});
