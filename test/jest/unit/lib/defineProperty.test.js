var defineProperty = require('@lib/defineProperty');

describe('@lib/defineProperty.js', function () {

    var defaultPropertyDescriptor = Object.getOwnPropertyDescriptor(
        Object.defineProperty({}, '_', {}),
        '_'
    );
    var defaultPropertyAccessor = {
        'get': void 0,
        'set': void 0,
        'configurable': false,
        'enumerable': false
    };

    it('Should throw if an invalid value is given.', function () {

        var object = {};

        expect(function () {

            /** The first argument must be an object. */
            defineProperty();

        }).toThrow(TypeError);

        expect(function () {

            /** The second argument (the key) is `undefined`. */
            defineProperty(object);

        }).not.toThrow(TypeError);

        expect(function () {

            /** `key` is `null`. */
            defineProperty(object, null);

        }).not.toThrow(TypeError);

    });

    it('Should return the given object.', function () {

        var object = {};

        expect(defineProperty(object, 'key', 'value')).toBe(object);

    });

    it('Should convert any value into a property descriptor.', function () {

        var emptyObject = {};
        var randomObject = {'some': 'value'};
        var someDescriptor = {'configurable': true};
        var descriptorWithNonDescriptors = Object.assign({}, someDescriptor, randomObject);
        var fn = function () {};

        test.each([
            [
                void 0,
                Object.assign({}, defaultPropertyDescriptor, {'value': void 0}),
                'Non objects into `value` attribute.'
            ],
            [
                emptyObject,
                Object.assign({}, defaultPropertyDescriptor, {'value': emptyObject}),
                'Empty objects into `value` attribute.'
            ],
            [
                randomObject,
                Object.assign({}, defaultPropertyDescriptor, {'value': randomObject}),
                'Objects without property descriptor attributes into `value` attribute.'
            ],
            [
                someDescriptor,
                Object.assign({}, defaultPropertyDescriptor, someDescriptor),
                'Property descriptors into property descriptors.'
            ],
            [
                {'get': fn},
                Object.assign({}, defaultPropertyAccessor, {'get': fn}),
                'Getters into getters.'
            ],
            [
                {'set': fn},
                Object.assign({}, defaultPropertyAccessor, {'set': fn}),
                'Setters into setters.'
            ],
            [
                descriptorWithNonDescriptors,
                Object.assign({}, defaultPropertyDescriptor, {'value': descriptorWithNonDescriptors}),
                'Property descriptor with other non-descriptor attributes into `value` attribute.'
            ]
        ], '%% %% %s', function (value, expected) {

            var key = '_';

            expect(Object.getOwnPropertyDescriptor(
                defineProperty({}, key, value),
                key
            )).toMatchObject(expected);

        });

    });

});
