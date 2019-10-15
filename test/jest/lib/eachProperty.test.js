var eachProperty = require('@src/lib/eachProperty');

describe('@src/lib/eachProperty.js', function () {

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

    it('Should call a function on each element found.', function () {

        var thisArg = {};
        var mainObject = {'a': 'x', 'b': 'y'};
        var interrupted = eachProperty(mainObject, function (value, key, object) {

            expect(this).toBe(thisArg);
            expect(value).toMatch(/^x|y$/);
            expect(key).toMatch(/^a|b$/);
            expect(object).toMatchObject(Object(mainObject));

        }, thisArg);

        expect(interrupted).toBe(false);

    });

    it('Should iterate all the owned properties of an object.', function () {

        /** No non-owned properties were found. */
        expect(findNonOwnedProperty(false)).toBe(false);

    });

    it('Should iterate the non-owned properties of an object.', function () {

        /** A non-owned property was found. */
        expect(findNonOwnedProperty(true)).toBe(true);

    });

    it('Should exit when the function returns a truthy value.', function () {

        var object = {'a': null, 'b': 1, 'c': null};
        var hasReturnedOnTime;
        var fail = jest.fn();
        var interrupted = eachProperty(object, function (v, k, o, s) {

            if (hasReturnedOnTime) {

                fail('The function didn\'t return on time.');

            }

            if (v === null) { return hasReturnedOnTime = true; }

        });

        expect(fail).not.toHaveBeenCalled();
        expect(interrupted).toBe(true);

    });

    it('Should throw if something is invalid.', function () {

        expect(function () {

            eachProperty(null, 'not a function');

        }).toThrow(TypeError);

    });

});
