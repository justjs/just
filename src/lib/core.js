define('APR', function () {

	'use strict';
	/**
	 * Something like: {}
	 * 
	 * @typedef {!Object} key-value-object
	 */
	/**
	 * An absolute, relative or blob url.
	 *
	 * @typedef {string} url
	 */
	/**
	 * @namespace APR
	 */
	var APR = {};

	return Object.defineProperties(APR, {
		// 'version': '%{CORE_VERSION}%',
		/**
		 * Sets a function in APR.
		 *
		 * @package
		 * @readOnly
		 * @function APR.setFn
		 *
		 * @param {String} name The name of the APR property.
		 * @param {Function} fn Some function.
		 * @param {} [propertiesDescriptor] Some properties to attach to fn.
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
		 * @function APR.setModule
		 *
		 * @param {String} name The name of the APR property.
		 * @param {Function} fn Some constructor.
		 * @param {} [propertiesDescriptor] Some properties to attach to fn.
		 * @param {} [prototypeDescriptor] Some properties to attach
		 *     to fn.prototype.
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
		 * @function APR.setProperty
		 *
		 * @param {String} name The name of the APR property.
		 * @param {} [descriptor] Some properties to attach to the property.
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
