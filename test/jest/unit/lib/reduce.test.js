var reduce = require('@lib/reduce');

describe('@lib/reduce', function () {

    it('Should reduce object\'s own enumerable properties.', function () {

        var object = Object.defineProperty({'a': 0, 'b': 1}, 'c', {
            'value': 3,
            'enumerable': false
        });
        var fn = jest.fn(function (accumulator, value, key) { return accumulator.concat(this[value]); });
        var accumulator = [];
        var thisArg = ['a', 'b'];
        var result;

        result = reduce(object, fn, accumulator, thisArg);

        // Make sure to don't test the order in which it was called.
        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenCalledWith(expect.any(Array), 0, 'a', object);
        expect(fn).toHaveBeenCalledWith(expect.any(Array), 1, 'b', object);
        expect(result.join('')).toMatch(/ab|ba/);

    });

});
