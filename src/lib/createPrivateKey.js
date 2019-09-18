define(['./core'], function (APR) {

    'use strict';

    /* globals WeakMap */

    /**
     * An store of private members.
     *
     * @typedef {function} APR.createPrivateKey~privateStore
     * @param {!Object} key - Some object to get/set properties from/to it.
     * @return {function} A private store.
     */

    /**
     * Implementation of private members in js.
     * @see {@link https://github.com/philipwalton/private-parts|Source}.
     *
     * @namespace
     * @memberof APR
     * @param {function|!object} [factory=Object.prototype] - A new object with `factory` as it's prototype...
     * @param {!object} [parent] - The object to inherit from.
     * @throws {TypeError} If the key given {@link APR.createPrivateKey~privateStore|in the private store}
     *     is not an object.
     * @example
     * // Creates an store which extends the public-constructor prototype.
     * // So you can call the public methods from the private ones.
     * var _ = createPrivateKey({
     *     privateMethod: function () {
     *         console.log(this); // Shows something like: {public: 'public', privateMethod: function(){}, prototype: Public.prototype, [...]}.
     *     }
     * }, Public);
     *
     * // Some constructor.
     * function Public () {
     *     this.public = 'public';
     *     // Note that `this` is an object.
     *     _(this).private = 'private';
     * }
     *
     * console.log(new Public()); // Shows [...] {public: 'public'}
     *
     * @return {APR.createPrivateKey~privateStore} An store of the private values.
     */
    var createPrivateKey = function createPrivateKey (factory, parent) {

        var store = new WeakMap();
        var seen = new WeakMap();

        /* eslint-disable padded-blocks*/
        if (parent instanceof Object) {
            factory = Object.assign(Object.create(parent.prototype), factory);
        }

        if (typeof factory !== 'function') {
            factory = Object.create.bind(null, factory || Object.prototype, {});
        }
        /* eslint-enable padded-blocks*/

        return function (key) {

            var value;

            /* eslint-disable padded-blocks*/
            if (!(key instanceof Object)) {
                throw new TypeError(key + ' must be an object.');
            }

            value = store.get(key);

            if (value) {
                return value;
            }

            if (seen.has(key)) {
                return key;
            }
            /* eslint-enable padded-blocks*/

            value = factory(key);
            store.set(key, value);
            seen.set(value, true);

            return value;

        };

    };

    return APR.setFn('createPrivateKey', createPrivateKey);

});
