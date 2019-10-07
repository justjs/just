define([
    './core',
    './eachProperty',
    './defineProperty'
], function (just, eachProperty, defineProperty) {

    'use strict';

    /**
     * Alternative to <var>Object.defineProperties</var>.
     *
     * @see {@link defineProperty} for more details.
     * @namespace
     * @memberof just
     * @param {!object} object - The target.
     * @param {!object} properties - {@link propertyDescriptor}
     * @return <var>object</var>
     */
    var defineProperties = function defineProperties (object, properties) {

        eachProperty(properties, function (value, key) {

            defineProperty(object, key, value);

        });

        return object;

    };

    return just.setFn('defineProperties', defineProperties);

});
