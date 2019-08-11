define('APR', function () {

	'use strict';
	/**
	 * An absolute, relative or blob url.
	 *
	 * @typedef {string} url
	 */
	 /**
	 * Same as the second param for `Object.defineProperties`
	 * 
	 * @typedef {?object} propertiesDescriptor
	 */
	/**
	 * Same as the third param for `Object.defineProperty`
	 *
	 * @typedef {?object} propertyDescriptor
	 */
	/**
	 * @namespace APR
	 */
	var APR = {};

	return Object.defineProperties(APR, /** @lends APR */{
		// 'version': '%{CORE_VERSION}%',
		/**
		 * Sets a function in APR.
		 *
		 * @function
		 * @package
		 * @readOnly
		 *
		 * @param {String} name - The name of the APR property.
		 * @param {Function} fn - Some function.
		 * @param {propertiesDescriptor} [propertiesDescriptor]
		 *     - Some properties to attach to fn.
		 *
		 * @return {!Function} fn. 
		 */
		'setFn': {
			'value': function setFn (name, fn, propertiesDescriptor) {

				if (propertiesDescriptor) {
					Object.defineProperties(fn, propertiesDescriptor);
				}

				Object.defineProperty(APR, name, {
					'value': fn
				});

				return APR[name];

			}
		},
		/**
		 * Sets a module in APR.
		 *
		 * @package
		 * @readOnly
		 * @function
		 * @param {String} name - The name of the APR property.
		 * @param {Function} fn - Some constructor.
		 * @param {propertiesDescriptor} [propertiesDescriptor]
		 *     - Some properties to attach to fn.
		 * @param {propertiesDescriptor} [prototypeDescriptor]
		 *     - Some properties to attach to fn.prototype.
		 *
		 * @returns {!Function} fn. 
		 */
		'setModule': {
			'value': function setModule (name, fn, propertiesDescriptor,
			prototypeDescriptor) {
			
				APR.setFn(name, fn, propertiesDescriptor);
				
				if (prototypeDescriptor) {
					Object.defineProperties(APR[name].prototype,
						prototypeDescriptor);
				}


				return APR[name];

			}
		},
		/**
		 * Sets a property in APR.
		 *
		 * @package
		 * @readOnly
		 * @function
		 *
		 * @param {String} name - The name of the APR property.
		 * @param {propertyDescriptor} [descriptor] - Some properties to attach to the property.
		 *
		 * @return {*} The added property.
		 */
		'setProperty': {
			'value': function setProperty (name, descriptor) {
			
				Object.defineProperty(APR, name, descriptor);

				return APR[name];

			}
		}

	});
	
});
