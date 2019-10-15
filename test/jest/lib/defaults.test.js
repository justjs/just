var defaults = require('@src/lib/defaults');

describe('@src/lib/defaults.js', function () {

    it('Should return the given value if it looks like ' +
		'the default value, or the default value otherwise.', function () {

        /** Defaults an `Array` to a "key-value object". */
        expect(defaults([1, 2], {'a': 1})).toMatchObject({'a': 1});
        /** A "key-value" object is not `null`. */
        expect(defaults({}, null)).toBeNull();
        /** `null` is an `object`. */
        expect(defaults([], null, {'checkLooks': false})).toMatchObject([]);
        /** `null` is not a "key-value object". */
        expect(defaults(null, {})).toMatchObject({});
        /** `null` is not an `Array`. */
        expect(defaults(null, [])).toMatchObject([]);
        /** `NaN` is an instance of a `Number` */
        expect(defaults(1, NaN)).toBe(1);

    });

    it('Should "default" the main keys to the default keys.', function () {

        /**
         * Keys got overriden because a deep check was performed
         * (although `ignoreDefaultKeys` was `true`).
         */
        expect(defaults({'a': 1, 'b': 2}, {'a': ''}, {
            'ignoreDefaultKeys': true,
            'checkLooks': true,
            'checkDeepLooks': true
        })).toMatchObject({'a': '', 'b': 2});

    });

    it('Should add the default keys to the main object.', function () {

        var mainObject = {'a': 1};
        var defaultObject = {'b': 2};

        expect(defaults(mainObject, defaultObject, {
            'ignoreDefaultKeys': false
        })).toMatchObject(Object.assign({}, mainObject, defaultObject));

    });

    it('Should ignore new keys.', function () {

        var mainObject = {'a': 1};
        var defaultObject = {'b': 2};

        expect(defaults(mainObject, defaultObject, {
            'ignoreDefaultKeys': true
        })).toMatchObject(mainObject);

    });

    it('Should check objects by his type instead of his look.', function () {

        /** `null` is accepted because `{}` is an object too. */
        expect(defaults(null, {'a': null}, {
            'checkLooks': false
        })).toBeNull();

        /** `null` is discarded because `null` !== {} */
        expect(defaults(null, {'a': null}, {
            'checkDeepLooks': false
        })).toMatchObject({'a': null});

        /** `[]` is accepted because `null` is an object too. */
        expect(defaults({'a': []}, {'a': null}, {
            'checkDeepLooks': false
        })).toMatchObject({'a': []});

        /** `checkDeepLooks` is useless when `checkLooks` is `false`. */
        expect(defaults(null, {'a': null}, {
            'checkLooks': false,
            'checkDeepLooks': false
        })).toBeNull();

    });

    it('Should ignore default null values.', function () {

        /** `1` is not an object. */
        expect(defaults(1, null, {'ignoreNull': false})).toBeNull();

        /** Any value is allowed, except undefined */
        expect(defaults(1, null, {'ignoreNull': true})).toBe(1);

        /** `undefined` defaults to null. */
        expect(defaults(void 0, null, {'ignoreNull': true})).toBeNull();

    });

    it('Should ignore default null values in an object.', function () {

        expect(defaults({'a': 0, 'b': void 0}, {'a': null, 'b': null}, {
            'ignoreNull': true
        })).toMatchObject({
            'a': 0,
            'b': null
        });

    });

});
