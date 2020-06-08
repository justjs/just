var parseJSON = require('@lib/parseJSON');

describe('@lib/parseJSON', function () {

    test.each([
        [null],
        [''],
        ['{""}']
    ])('Should return null if an exception occurs.', function (value) {

        expect(parseJSON(value)).toBe(null);

    });

    test.each([
        [{}],
        [[]],
        [null]
    ])('Should return the given object.', function (value) {

        expect(parseJSON(value)).toBe(value);

    });

    test.each([
        [1, 1],
        [false, false],
        ['{"a": 1}', {'a': 1}],
        ['[]', []]
    ])('Should parse %o and return %o.', function (value, expected) {

        expect(parseJSON(value)).toEqual(expected);

    });

});
