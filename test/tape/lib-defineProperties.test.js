var test = require('tape');
var defineProperties = require('../../src/lib/defineProperties');

// TODO: Mock
test('lib/defineProperties.js', function (t) {

    var defaultDescriptors = Object.getOwnPropertyDescriptor(
        Object.defineProperty({}, '_', {}),
        '_'
    );

    t.test('Should define multiple properties.', function (st) {

        [
            [
                1,
                {'value': 1},
                'Non property descriptors.'
            ],
            [
                {},
                {'value': {}},
                'Empty objects.'
            ],
            [
                {'configurable': true},
                {'configurable': true},
                'Property descriptors.'
            ],
            [
                {'value': 1, 'not': 'descriptor'},
                {'value': {'value': 1, 'not': 'descriptor'}},
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
                Object.assign({}, defaultDescriptors, values[1]),
                values[2]
            );

        });

        st.end();

    });

    t.end();

});
