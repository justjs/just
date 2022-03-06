(function () {

	'use strict';

	var onWindowResize = function onWindowResize () {

		var html = document.documentElement;
		var innerHeight = window.innerHeight;

		// Fix 100vh for firefox on mobile.
		try { html.style.setProperty('--vh100', innerHeight + 'px'); }
		catch (e) { /* Do nothing */ }

	};

	window.addEventListener('resize', onWindowResize);

	onWindowResize();

})();
