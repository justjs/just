define(['./core'], function (APR) {

	'use strict';

	return APR.setFn('inheritFrom', /** @lends APR */
	/**
	 * "Inherits" properties from `target` into `base`.
	 *
	 * @function
	 * @param {!Object} target - The object to inherit the prototype from.
	 * @param {!Object} base - The main object.
	 *
	 * @return `target`
	 */
	function inheritFrom (target, base) {

		base.prototype = Object.assign(Object.create(
			target.prototype), {
			'constructor': base
		});

		return target;

	});

});
