define(['../core'], function (APR) {

	'use strict';

	/**
	 * The DoNotTrack header formatted as true, false or undefined
	 * (for "unspecified").
	 *
	 * @namespace
	 * @memberof APR
	 * @type {boolean|undefined}
	 * @readOnly
	 */
	var DNT = {

		'get': function DNT () {

			var dnt = [
				navigator.doNotTrack,
				navigator.msDoNotTrack,
				window.doNotTrack
			];
			var consent = ',' + dnt + ',';

			return (/,(yes|1),/i.test(consent)
				? true
				: /,(no|0),/i.test(consent)
				? false
				: void 0
			);

		}

	};

	return APR.property.DNT = DNT;

});