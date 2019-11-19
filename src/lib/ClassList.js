var defineProperties = require('./defineProperties');

/**
 * Chainable methods for the classList property.
 *
 * @namespace
 * @memberof just
 *
 * @constructor
 * @param {Element} element - The target.
 *
 * @example
 * let force;
 *
 * ClassList(button)
 *     .add('a', 'b', 'c')
 *     .remove('b')
 *     .toggle('c', (force = true))
 *     .replace('a', 'z')
 *     .contains('b'); // false
 */
function ClassList (element) {

    if (!(this instanceof ClassList)) { return new ClassList(element); }

    /** @member {Element} */
    this.element = element;

}

defineProperties(ClassList, /** @lends just.ClassList */{

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
    'apply': function (element, methodName, methodArgs) {

        var args = typeof methodArgs === 'number' ? [methodArgs] : Array.from(methodArgs);
        var classList = element.classList;

        if (/(?:add|remove)/.test(methodName)) {

            args.forEach(function (arg) { classList[methodName](arg); });

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

});

defineProperties(ClassList.prototype, /** @lends just.ClassList.prototype */{

    /**
     * @alias Element.classList.add
     * @chainable
     */
    'add': function () {

        ClassList.apply(this.element, 'add', arguments);

        return this;

    },
    /**
     * @alias Element.classList.remove
     * @chainable
     */
    'remove': function () {

        ClassList.apply(this.element, 'remove', arguments);

        return this;

    },
    /**
     * @alias Element.classList.toggle
     * @chainable
     */
    'toggle': function () {

        ClassList.apply(this.element, 'toggle', arguments);

        return this;

    },
    /**
     * @alias Element.classList.replace
     * @chainable
     */
    'replace': function () {

        ClassList.apply(this.element, 'replace', arguments);

        return this;

    },
    /**
     * @alias Element.classList.contains
     * @return {boolean}
     */
    'contains': function () {

        return ClassList.apply(this.element, 'contains', arguments);

    },
    /**
     * @alias Element.classList.item
     * @return {?string}
     */
    'item': function () {

        return ClassList.apply(this.element, 'item', arguments);

    }

});

module.exports = ClassList;
