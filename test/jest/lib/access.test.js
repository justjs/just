var access = require('@lib/access');

describe('@lib/access.js', function () {

    it('Should access to one existent property.', function () {

        var fn = jest.fn();

        access({'x': 1}, ['x'], fn);

        expect(fn).toHaveBeenCalledWith({'x': 1}, 'x', true, ['x']);

    });

    it('Should return the value returned from the handler.', function () {

        var expectedValue = 'expected';
        var fn = function () { return expectedValue; };

        expect(access({}, [], fn)).toBe(expectedValue);

    });

    it('Should return the accessed value if no handler is given.', function () {

        var expectedValue = 'expected';

        expect(access({'a': expectedValue}, 'a')).toBe(expectedValue);

    });

    it('Should normalize the property path to an array.', function () {

        var expectedValue = 'expected';
        var object = {'a': expectedValue};

        expect(access(object, ['a'])).toBe(access(object, 'a'));

    });

    it('Should access to one non-existent property.', function () {

        var fn = jest.fn();

        access({}, ['x'], fn);

        expect(fn).toHaveBeenCalledWith({}, 'x', false, ['x']);

    });

    it('Should access to one deep existent property.', function () {

        var expectedValue = 'expected';
        var baseObject = {'a': {'b': {'c': expectedValue}}};
        var keys = ['a', 'b', 'c'];
        var fn = jest.fn();

        access(baseObject, keys, fn, {'mutate': false});
        expect(fn).toHaveBeenCalledWith({'c': expectedValue}, 'c', true, keys);

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

        expect(function () {

            /** override is true by default. */
            access({'a': 1}, ['a', 'b']);

        }).not.toThrow(TypeError);

    });

    it('Should create and access to some non-existent properties.', function () {

        var fn = jest.fn();
        var keys = ['a', 'b'];

        access({}, keys, fn);
        expect(fn).toHaveBeenCalledWith({}, 'b', false, keys);

    });

    it('Should not modify the base object.', function () {

        var fn = function () { return this; };
        var object = {};

        expect(access(object, 'new', fn)).not.toBe(object);
        expect(object).not.toHaveProperty('new');

        expect(access(object, 'new', fn, {'mutate': false})).not.toBe(object);
        expect(object).not.toHaveProperty('new');

    });

    it('Should modify the base object.', function () {

        var fn = function () { return this; };
        var object = {};

        expect(access(object, ['a', 'b'], fn, {'mutate': true})).toBe(object);
        expect(object).toHaveProperty('a');

        /**
         * Since `fn` didn't modify the last property,
         * the last key won't be present.
         */
        expect(object).not.toHaveProperty('a.b');

    });

});
