var hasOwnPropertySpy = jest.spyOn(Object.prototype, 'hasOwnProperty');
var assign = require('@lib/assign');

describe('@lib/assign', function () {

    test.each([
        ['null', null],
        ['not an object', undefined]
    ])('Should throw if the target is %s.', function (_, value) {

        expect(function () { assign(value); }).toThrow();

    });

    test.each([
        [[{'a': 1}, {'b': 2}, {'c': 3}]]
    ])('Should merge objects.', function (objects) {

        expect(assign.apply(Object, objects)).toMatchObject(Object.assign.apply(Object, objects));

    });

    it('Should return the target object.', function () {

        var target = {};
        var expected = target;

        expect(assign(target)).toBe(expected);

    });

    test.each([
        [{}, Object.defineProperty({}, 'a', {
            'value': 1,
            'writable': true,
            'enumerable': false
        }), {}]
    ])('Should only copy enumerable properties.', function (target, source, expected) {

        expect(assign(target, source)).toMatchObject(expected);

    });

    it('Should not use hasOwnProperty from the given object.', function () {

        var target = {};
        var source = {
            'hasOwnProperty': jest.fn()
        };

        assign(target, source);

        expect(source.hasOwnProperty).not.toHaveBeenCalled();

    });

    it('Should check for own properties.', function () {

        var target = {};
        var source = {'a': 1};
        var spy = hasOwnPropertySpy
            .mockImplementationOnce(function () { return false; });

        assign(target, source);

        expect(spy).toHaveBeenCalled();

    });

});
