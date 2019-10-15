var toObjectLiteral = require('@src/lib/toObjectLiteral');

describe('@src/lib/toObjectLiteral.js', function () {

    it('Should convert null, object literals and arrays and ' +
		'return a new object, and throw with malformed values.', function () {

        expect(function () {

            /** Empty arrays return empty object literals. */
            expect(toObjectLiteral([])).toMatchObject({});

        }).not.toThrow(TypeError);

        expect(function () {

            /** Malformed arrays throw. */
            toObjectLiteral([0, 1]);

        }).toThrow(TypeError);

        expect(function () {

            var keyValueObject = {'a': 1};

            /**
             * object literals return a new object literal
             * containing his owned properties.
             */
            expect(toObjectLiteral(keyValueObject)).not.toBe(keyValueObject);
            expect(toObjectLiteral(keyValueObject), keyValueObject);

        }).not.toThrow(TypeError);

        expect(function () {

            /** null return an empty object literal. */
            expect(toObjectLiteral(null), {});

        }).not.toThrow(TypeError);

    });

    it('Should convert an array of object literal pairs to ' +
		'an object literal.', function () {

        /** Converts sub-arrays. */
        expect(toObjectLiteral([['a', 1], ['b', 2]])).toMatchObject({
            'a': 1,
            'b': 2
        });

        /** Converts sub-arrays and assigns object literal sub-objects. */
        expect(toObjectLiteral([{'a': 1, 'b': 2}, ['c', 3]])).toMatchObject({
            'a': 1,
            'b': 2,
            'c': 3
        });

    });

    it('Should use the first 2 values of the sub arrays and ' +
		'ignore the other ones.', function () {

        expect(toObjectLiteral([
            ['a', 1, 'ignored', 'ignored too'],
            ['b', 2, 'ignored']
        ])).toMatchObject({
            'a': 1,
            'b': 2
        });

    });

    it('Should throw if an invalid object is passed.', function () {

        expect(function () {

            toObjectLiteral();

        }).toThrow(TypeError);

    });

});
