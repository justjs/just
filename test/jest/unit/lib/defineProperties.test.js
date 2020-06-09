var defineProperties = require('@lib/defineProperties');

// TODO: Mock
test('@lib/defineProperties.js', function () {

    var defaultDescriptors = Object.getOwnPropertyDescriptor(
        Object.defineProperty({}, '_', {}),
        '_'
    );
    var defaultAccessors = {
        'get': void 0,
        'set': void 0,
        'configurable': false,
        'enumerable': false
    };
    var fn = function () {};

    test.each([
        [
            1,
            Object.assign({}, defaultDescriptors, {'value': 1}),
            'Non property descriptors.'
        ],
        [
            {},
            Object.assign({}, defaultDescriptors, {'value': {}}),
            'Empty objects.'
        ],
        [
            {'configurable': true},
            Object.assign({}, defaultDescriptors, {'configurable': true}),
            'Property descriptors.'
        ],
        [
            {'get': fn},
            Object.assign({}, defaultAccessors, {'get': fn}),
            'Getters into getters.'
        ],
        [
            {'set': fn},
            Object.assign({}, defaultAccessors, {'set': fn}),
            'Setters into setters.'
        ],
        [
            {'value': 1, 'not': 'descriptor'},
            Object.assign({}, defaultDescriptors, {'value': {'value': 1, 'not': 'descriptor'}}),
            'Mixed property descriptors.'
        ]
    ], 'Should define multiple properties: %# %% %% %s', function (value, expected, reason) {

        var key = '_';
        var properties = {};

        properties[key] = value;

        expect(Object.getOwnPropertyDescriptor(
            defineProperties({}, properties),
            key
        )).toMatchObject(expected);

    });

    test.each([
        [
            {'a': 1, 'b': {'value': 2}},
            {'value': 'common'},
            {
                'a': Object.assign({}, defaultDescriptors, {'value': 'common'}),
                'b': Object.assign({}, defaultDescriptors, {'value': 'common'})
            }
        ],
        [
            {'a': 1, 'b': {'value': 2}},
            {'writable': true},
            {
                'a': Object.assign({}, defaultDescriptors, {'value': 1, 'writable': true}),
                'b': Object.assign({}, defaultDescriptors, {'value': 2, 'writable': true})
            }
        ],
        [
            {'a': 1, 'b': {'value': 2}},
            {'get': fn},
            {
                'a': Object.assign({}, defaultDescriptors, {'value': 1, 'get': fn}),
                'b': Object.assign({}, defaultDescriptors, {'value': 2, 'get': fn})
            }
        ],
        [
            {'a': 1, 'b': {'value': 2}},
            {'set': fn},
            {
                'a': Object.assign({}, defaultDescriptors, {'value': 1, 'set': fn}),
                'b': Object.assign({}, defaultDescriptors, {'value': 2, 'set': fn})
            }
        ],
        [
            {'a': 1, 'b': {'value': 2}},
            {'configurable': true},
            {
                'a': Object.assign({}, defaultDescriptors, {'value': 1, 'configurable': true}),
                'b': Object.assign({}, defaultDescriptors, {'value': 2, 'configurable': true})
            }
        ],
        [
            {'a': 1, 'b': {'value': 2}},
            {'enumerable': true},
            {
                'a': Object.assign({}, defaultDescriptors, {'value': 1, 'enumerable': true}),
                'b': Object.assign({}, defaultDescriptors, {'value': 2, 'enumerable': true})
            }
        ],
        [
            {'a': 1, 'b': {'value': 2}},
            'not a descriptor',
            Error
        ],
    ], 'Should set a common descriptor.', function (properties, commonDescriptor, expected) {

        var object = {};

        if (expected === Error) {

            expect(function () {

                defineProperties(object, properties, commonDescriptor);

            }).toThrow(Error);

        }
        else {

            expect(Object.getOwnPropertyDescriptors(
                defineProperties(object, properties, commonDescriptor)
            )).toMatchObject(expected);

        }

    });

});
