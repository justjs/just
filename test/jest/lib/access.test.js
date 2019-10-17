var access = require('@lib/access');

describe('@lib/access.js', function () {

    it('Should access to one property.', function () {

        access({'x': 1}, 'x', function (o, k, exists, path) {

            expect(o[k]).toBe(1);
            expect(exists).toBe(true);
            expect(path).toMatchObject(['x']);

        });

    });

    it('Should access to one non-existent property.', function () {

        access({}, 'x', function (o, k, exists, path) {

            expect(o[k]).not.toBeDefined();
            expect(exists).toBe(false);
            expect(path).toMatchObject(['x']);

        });

    });

    it('Should work as expected and access to a deep existent ' +
		'property.', function () {

        var expectedValue = 'expected';
        var baseObject = {'a': {'b': {'c': {'d': expectedValue}}}};
        var keys = ['a', 'b', 'c', 'd'];
        var result = access(baseObject, keys, function (lastObject, lastKey,
            exists, path) {

            expect(lastKey).toMatch(/^(a|b|c|d)$/);
            expect(exists).toBe(true);
            expect(path).toMatchObject(keys);

            return (exists
                ? lastObject[lastKey]
                : null
            );

        }, {'mutate': false});

        expect(result).toBe(expectedValue);

    });

    it('Should return the accessed value if no handler ' +
		'is given.', function () {

        var expectedValue = 'expected';
        var object = {'a': {'b': expectedValue}};
        var keys = ['a', 'b'];

        expect(access(object, keys)).toBe(expectedValue);

    });

    it('Should throw (or not) if some property doesn\'t hold ' +
		'an object as a value.', function () {

        expect(function () {

            /**
             * The object contains a property ("a") that
             * doesn't contain an object as a value (1).
             */
            access({'a': 1}, ['a', 'b', 'c'], null, {'override': false});

        }).toThrow(TypeError);

        expect(function () {

            /** The property ("a") was overriden by an empty object. */
            access({'a': 1}, ['a', 'b', 'c'], null, {'override': true});

        }).not.toThrow(TypeError);

    });

    it('Should create and access to some non-existent properties.', function () {

        var object = Object.assign({'z': 1}, {
            'prototype': Function.prototype
        });
        var keys = ['a', 'b', 'c'];
        var newObject = access(object, keys, function (lastObject, lastKey,
            exists, path) {

            expect(this).not.toBe(object);
            expect(lastObject).toMatchObject({});
            expect(lastKey).toBe('c');
            expect(exists).toBe(false);

            if (!exists) { lastObject[lastKey] = path.length; }

            return this;

        }, {'mutate': false});

        expect(newObject).toMatchObject(
            Object.assign({'a': {'b': {'c': 3}}}, object)
        );

    });

    it('Should modify the base object.', function () {

        var object = {'a': {'b': false}, 'b': {'b': false}};
        var keys = 'a.b'.split('.');
        var result = access(object, keys, function (lastObject, lastKey) {

            lastObject[lastKey] = true;

            return this;

        }, {'mutate': true});

        expect(object).toMatchObject({'a': {'b': true}, 'b': {'b': false}});
        expect(result).toBe(object);

    });

});
