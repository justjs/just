define(function () {

	'use strict';

	var dnt = [navigator.doNotTrack, navigator.msDoNotTrack, window.doNotTrack];
	var consent = ',' + dnt + ',';

	/**
	 * The DoNotTrack header formatted as 0, 1 or undefined (for "unspecified").
	 * @type {(number|undefined)}
	 * @readOnly
	 */
	return (/,(yes|1),/i.test(consent)
		? 1
		: /,(no|0),/i.test(consent)
		? 0
		: void 0
	);

});