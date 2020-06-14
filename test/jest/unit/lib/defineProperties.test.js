var defineProperties = require('@lib/defineProperties');

// TODO: Mock
describe('@lib/defineProperties.js', function () {

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
    ])('Should define multiple properties: %# %% %% %s', function (value, expected, reason) {

        var key = '_';
        var properties = {};

        properties[key] = value;

        expect(Object.getOwnPropertyDescriptor(
            defineProperties({}, properties),
            key
        )).toMatchObject(expected);

    });

});
