define(['./core', './defaults'], function (APR, defaults) {
	
	'use strict';

	/**
	 * @typedef {!Object} APR~eachProperty_options
	 *
	 * @property {boolean} [addNonOwned=false] Include non-owned properties
	 *     false: iterate only the owned properties.
	 *     true: iterate the (enumerable) inherited properties too.
	 *
	 * @property {APR~each_fn~store} [store=null] Some object.
	 */
	
	/**
	 * Iterates over a key-value object, calls a function on
	 * each iteration and if truthy value is returned, the loop
	 * will stop.
	 * 
	 * @param  {Object} [object=Object(object)] Some value.
	 * @param  {APR~eachProperty_fn} fn The function that will be
	 *     called on each iteration.
	 * @param  {*} [thisArg] `this` for `fn`.
	 * @param  {APR~eachProperty_options} [
	 *     opts=APR~eachProperty.DEFAULT_OPTIONS
	 * ] Some options.
	 *
	 * @throws TypeError If `fn` is not a function.
	 *
	 * @return {APR~eachProperty~store} The stored values.
	 */
	return APR.setFn('eachProperty', function eachProperty (object,
		fn, thisArg, opts) {

		var properties = Object(object);
		var options = defaults(opts, eachProperty.DEFAULT_OPTIONS, {
			'checkDeepLooks': false
		});
		var store = options.store;
		var terminate = false;
		var k;

		if (typeof fn !== 'function') {
			throw new TypeError(fn + ' is not a function.');
		}

		for (k in properties) {

			if (terminate) {
				break;
			}

			if (options.addNonOwned ||
				({}).hasOwnProperty.call(properties, k)) {
				
				terminate = fn.call(thisArg, properties[k], k,
					properties, store);

			}

		}

		return store;

	}, /** @lends APR.eachProperty */{
		/**
		 * @property {APR~eachProperty_options} DEFAULT_OPTIONS
		 * @readOnly
		 */
		'DEFAULT_OPTIONS': {
			'get': function () {
				return {
					'addNonOwned': false,
					'store': {}
				};
			}
		}

	});

});