define(['./core'], function (APR) {

	'use strict';

	/**
	 * "Inherits" properties from `target` into `base`.
	 *
	 * @namespace
	 * @memberof APR
	 * @param {!object} target - The object to inherit the prototype from.
	 * @param {!object} base - The main object.
	 *
	 * @return `target`
	 */
	var inheritFrom = function inheritFrom (target, base) {

		base.prototype = Object.assign(Object.create(
			target.prototype), {
			'constructor': base
		});

		return target;

	};

	return APR.fn.inheritFrom = inheritFrom;

});
