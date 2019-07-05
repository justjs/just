define(['../core'], function (APR) {

	'use strict';

	return APR.setProperty('DNT', /** @lends APR */
	/**
	 * The DoNotTrack header formatted as true, false or undefined
	 * (for "unspecified").
	 *
	 * @type {(boolean|undefined)}
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
				? true
				: /,(no|0),/i.test(consent)
				? false
				: void 0
			);

		}

	});

});