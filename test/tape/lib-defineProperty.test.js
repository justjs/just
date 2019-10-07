var test = require('tape');
var defineProperty = require('../../src/lib/defineProperty');

test('lib/defineProperty.js', function (t) {

    var defaultPropertyDescriptor = Object.getOwnPropertyDescriptor(
        Object.defineProperty({}, '_', {}),
        '_'
    );

    t.test('Should throw if an invalid value is given.', function (st) {

        var object = {};

        st.throws(function () { defineProperty(); }, TypeError,
            '`object` must be an object.');
        st.doesNotThrow(function () { defineProperty(object); }, TypeError,
            '`key` is `undefined`.');
        st.doesNotThrow(function () { defineProperty(object, null); }, TypeError,
            '`key` is `null`.');

        st.end();

    });

    t.test('Should return the given object.', function (st) {

        var object = {};

        st.is(defineProperty(object, 'key', 'value'), object);
        st.end();

    });

    t.test('Should convert any value into a property descriptor.', function (
        st) {

        var emptyObject = {};
        var randomObject = {'some': 'value'};
        var someDescriptor = {'configurable': true};
        var descriptorWithNonDescriptors = Object.assign({}, someDescriptor, randomObject);

        [
            [
                void 0,
                defaultPropertyDescriptor,
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
                descriptorWithNonDescriptors,
                Object.assign({}, defaultPropertyDescriptor, {'value': descriptorWithNonDescriptors}),
                'Property descriptor with other non-descriptor attributes into `value` attribute.'
            ]
        ].forEach(function (values, i) {

            var key = i + '';

            st.deepEquals(Object.getOwnPropertyDescriptor(
                defineProperty({}, key, values[0]),
                key
            ), values[1], values[2]);

        });

        st.end();

    });

    t.end();

});
