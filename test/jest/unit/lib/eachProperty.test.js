/**
 * @deprecated since 1.0.0-rc.22
 */
var eachProperty = require('@lib/eachProperty');

describe.skip('@lib/eachProperty.js', function () {

    it('Should call a function on each element found.', function () {

        var thisArg = {};
        var mainObject = {'a': 'x', 'b': 'y'};
        var fn = jest.fn(function (value, key, object) {

            expect(this).toBe(thisArg);
            expect(value).toMatch(/^x|y$/);
            expect(key).toMatch(/^a|b$/);
            expect(object).toMatchObject(Object(mainObject));

        });

        eachProperty(mainObject, fn, thisArg);
        expect(fn).toHaveBeenCalledTimes(2);

    });

    it('Should iterate all the owned properties of an object.', function () {

        var fn = jest.fn();
        var spy = jest.spyOn(Object.prototype, 'hasOwnProperty');

        eachProperty({'a': 1}, fn);
        expect(spy).toHaveBeenCalledWith('a');
        expect(spy).toHaveReturnedWith(true);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(1, 'a', {'a': 1});

        spy.mockRestore();

    });

    it('Should iterate the non-owned properties of an object.', function () {

        var fn = jest.fn();
        var mock = jest.spyOn(Object.prototype, 'hasOwnProperty')
            .mockImplementation(function (key) { return key !== 'a'; });

        eachProperty({'a': 1}, fn, {'addNonOwned': true});
        expect(fn).not.toHaveBeenCalled();

        mock.mockRestore();

    });

    it('Should exit when the function returns a truthy value.', function () {

        var fn = jest.fn(function () { return true; });
        var interrupted = eachProperty({'a': 1, 'b': 2}, fn);

        expect(interrupted).toBe(true);
        expect(fn).toHaveBeenCalledTimes(1);

    });

    it('Should throw if something is invalid.', function () {

        expect(function () {

            eachProperty(null, 'not a function');

        }).toThrow(TypeError);

    });

});
