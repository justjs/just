define(['../core'], function (APR) {

	'use strict';

	return APR.setProperty('DNT', /** @lends APR */
	/**
	 * The DoNotTrack header formatted as 0, 1 or undefined
	 * (for "unspecified").
	 *
	 * @type {(number|undefined)}
	 * @readOnly
	 */
	{

		'get': function DNT () {

			var dnt = [
				navigator.doNotTrack,
				navigator.msDoNotTrack,
				window.doNotTrack
			];
			var consent = ',' + dnt + ',';

			return (/,(yes|1),/i.test(consent)
				? 1
				: /,(no|0),/i.test(consent)
				? 0
				: void 0
			);

		}

	});

});