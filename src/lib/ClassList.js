define(['./core', './defaults'], function (APR, defaults) {

    'use strict';

    /**
     * Chainable methods for the classList property.
     *
     * @namespace
     * @memberof APR
     *
     * @constructor
     * @param {Element} element - The target.
     *
     * @example
     * ClassList(button)
     *     .add('a', 'b', 'c')
     *     .remove('b')
     *     .toggle('c', (let force = true))
     *     .replace('a', 'z')
     *     .contains('b'); // false
     */
    var ClassList = function ClassList (element) {

        /* eslint-disable padded-blocks */
        if (!(this instanceof ClassList)) {
            return new ClassList(element);
        }
        /* eslint-enable padded-blocks */

        /** @ŧype {Element} */
        this.element = element;

    };

    Object.defineProperties(ClassList, /** @lends APR.ClassList */{

        /**
         * Simulate Element.classList.prototype.method.apply(element, args)
         * since it's not possible to call a classList-method that way.
         *
         * @param {Element} element - The target.
         * @param {string} methodName - The name of the classList method to call.
         * @param {array[]|*} [methodArgs=[methodArgs]] - Arguments for the classList method.
         * @return Whatever the method returns.
         *
         * @example
         * ClassList.apply(this, 'add', ['x', 'b']); // > undefined
         * ClassList.apply(this, 'remove', 'c'); // > undefined
         * ClassList.apply(this, 'toggle', ['a', true]); // > true
         */
        'apply': {
            'value': function (element, methodName, methodArgs) {

                var args = [].slice.call(methodArgs);
                var classList = element.classList;

                if (/add|remove/.test(methodName)) {

                    Array.from(args, function (arg) { classList[methodName](arg); });

                    /** These methods return undefined. */
                    return void 0;

                }

                /*
                 * Passing undefined arguments instead of manually
                 * adding more conditionals to call the method with
                 * the correct amount shouldn't be a problem.
                 *
                 * I.e:
                 * classList.contains('a', undefined);
                 * classList.contains('a', 'some other value');
                 *
                 * Should be the same as calling...
                 * classList.contains('a');
                 */
                return classList[methodName](args[0], args[1]);

            }
        }

    });

    Object.defineProperties(ClassList.prototype, /** @lends APR.ClassList.prototype */{

        /**
         * @alias Element.classList.add
         * @chainable
         */
        'add': {
            'value': function () {

                ClassList.apply(this.element, 'add', arguments);

                return this;

            }
        },
        /**
         * @alias Element.classList.remove
         * @chainable
         */
        'remove': {
            'value': function () {

                ClassList.apply(this.element, 'remove', arguments);

                return this;

            }
        },
        /**
         * @alias Element.classList.toggle
         * @chainable
         */
        'toggle': {
            'value': function () {

                return ClassList.apply(this.element, 'toggle', arguments);

            }
        },
        /**
         * @alias Element.classList.replace
         * @chainable
         */
        'replace': {
            'value': function () {

                ClassList.apply(this.element, 'replace', arguments);

                return this;

            }
        },
        /**
         * @alias Element.classList.contains
         * @return {boolean}
         */
        'contains': {
            'value': function () {

                return ClassList.apply(this.element, 'contains', arguments);

            }
        },
        /**
         * @alias Element.classList.item
         * @return {?string}
         */
        'item': {
            'value': function () {

                return ClassList.apply(this.element, 'item', arguments);

            }
        }

    });

    return APR.setFn('ClassList', ClassList);

});

