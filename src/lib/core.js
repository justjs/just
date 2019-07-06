define('APR', function () {

	'use strict';

	var APR = {};

	return Object.defineProperties(APR, /** @lends APR */{
		// 'version': '%{CORE_VERSION}%',
		/**
		 * @property {Function} setFn Sets a function in APR.
		 *
		 * @param {String} name The name of the APR property.
		 * @param {Function} fn Some function.
		 * @param {} [propertiesDescriptor] Some properties to attach to fn.
		 * @return {!Function} fn. 
		 * @readOnly
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
		 * @property {Function} setModule Sets a module in APR.
		 *
		 * @param {String} name The name of the APR property.
		 * @param {Function} fn Some constructor.
		 * @param {} [propertiesDescriptor] Some properties to attach to fn.
		 * @param {} [prototypeDescriptor] Some properties to attach
		 *     to fn.prototype.
		 *
		 * @returns {!Function} fn. 
		 * @readOnly
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
		 * @property {Function} setProperty Sets a property in APR.
		 *
		 * @param {String} name The name of the APR property.
		 * @param {} [descriptor] Some properties to attach to the property.
		 *
		 * @return {*} The added property.
		 *
		 * @readOnly
		 */
		'setProperty': {
			'value': function setProperty (name, descriptor) {
			
				Object.defineProperty(APR, name, descriptor);

				return APR[name];

			}
		}

	});
	
});
