define(['./core'], function (APR) {

	'use strict';

	/**
	 * "Inherits" properties from `target` into `base`.
	 *
	 * @param {!Object} target The object to inherit the prototype from.
	 * @param {!Object} base The main object.
	 *
	 * @return `target`
	 */
	return APR.setFn('inheritFrom', function inheritFrom (target, base) {

		base.prototype = Object.assign(Object.create(
			target.prototype), {
			'constructor': base
		});

		return target;

	});

});