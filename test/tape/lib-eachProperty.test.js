var test = require('tape');
var eachProperty = require('../../src/lib/eachProperty');

test('lib/eachProperty.js', function (t) {

    var findNonOwnedProperty = function (flag) {

        var found = false;

        function TestObject () {}

        TestObject.own = true;

        // Demostration purposes.
        Function.prototype.nonOwn = true;

        eachProperty(TestObject, function (v, k, o, s) {

            if (!({}).hasOwnProperty.call(o, k)) { found = true; }

        }, null, {'addNonOwned': flag});

        delete Function.prototype.nonOwn;

        return found;

    };

    t.test('Should call a function on each element found.', function (st) {

        var mainObject = {'a': 1, 'b': 2};
        var interrupted = eachProperty(mainObject,
            function (value, key, object) {

                st.is(this, st);
                st.is(/^1|2$/.test(value), true);
                st.is(/^a|b$/.test(key), true);
                st.deepEquals(object, Object(mainObject));

            }, st);

        st.is(interrupted, false);

        st.end();

    });

    t.test('Should iterate all the owned properties of an object.', function (st) {

        st.is(findNonOwnedProperty(false), false,
            'No non-owned properties were found.');

        st.end();

    });

    t.test('Should iterate the non-owned properties of an object.', function (st) {

        st.is(findNonOwnedProperty(true), true,
            'A non-owned property was found.');

        st.end();

    });

    t.test('Should exit when the function returns a truthy value.', function (st) {

        var object = {'a': null, 'b': 1, 'c': null};
        var hasReturnedOnTime;
        var interrupted = eachProperty(object, function (v, k, o, s) {

            if (hasReturnedOnTime) {

                hasReturnedOnTime = false;
                st.fail('The function didn\'t return on time.');
                st.end();

            }

            if (v === null) {

                return hasReturnedOnTime = true;

            }

        });

        st.is(hasReturnedOnTime, true);
        st.is(interrupted, true);
        st.end();

    });

    t.test('Should throw if something is invalid.', function (st) {

        st.plan(1);

        st.throws(function () {

            eachProperty(null, 'not a function');

        }, TypeError);

    });

    t.end();

});
