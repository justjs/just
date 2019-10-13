var test = require('tape');
var defineProperties = require('../../src/lib/defineProperties');

// TODO: Mock
test('lib/defineProperties.js', function (t) {

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

    t.test('Should define multiple properties.', function (st) {

        var fn = function () {};

        [
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
        ].forEach(function (values) {

            var key = '_';
            var value = values[0];
            var properties = {};

            properties[key] = value;

            st.deepEquals(
                Object.getOwnPropertyDescriptor(
                    defineProperties({}, properties),
                    key
                ),
                values[1],
                values[2]
            );

        });

        st.end();

    });

    t.end();

});
