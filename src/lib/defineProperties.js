define(['./defineProperty'], function (defineProperty) {

    'use strict';

    /**
     * Alternative to <var>Object.defineProperties</var>.
     *
     * @see {@link defineProperty} for more details.
     * @namespace
     * @memberof just
     * @param {!object} object
     * @param {!object.<key, propertyDescriptor>|!object.<key, value>} properties
     * @return <var>object</var>
     */
    var defineProperties = function defineProperties (object, properties) {

        var key, value;

        for (key in properties) {

            value = properties[key];

            if (({}).hasOwnProperty.call(properties, key)) {

                defineProperty(object, key, value);

            }

        }

        return object;

    };

    return defineProperties;

});
