var test = require('tape');
var toArray = require('../../src/lib/toArray');

test('lib/toArray.js', function (t) {

    t.test('Should convert non objects to arrays', function (st) {

        [
            [
                'string',
                ['string'],
                'Non-objects are wrapped.'
            ],
            [
                1,
                [1],
                'Numbers are wrapped.'
            ],
            [
                {},
                [],
                'Empty objects become empty arrays.'
            ],
            [
                {0: 'a', 'length': 1},
                ['a'],
                'Array-like objects become arrays.'
            ],
            [
                {0: 'a', 1: 'b'},
                ['a', 'b'],
                'Array-like objects without `length` become arrays.'
            ],
            [
                {'b': 1, 'A': 0},
                [0, 1],
                'Objects with non-number keys get sorted and converted into an array.'
            ]
        ].forEach(function (values) {

            st.deepEquals(toArray(values[0]), values[1], values[2]);

        });

        st.end();

    });

    t.end();

});
