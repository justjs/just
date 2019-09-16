var test = require('tape'),
	isTouchDevice = require('../../src/lib/isTouchDevice');

test('lib/isTouchDevice.js', function (t) {

	t.test('Should check for touch support.', function (st) {

		var isTouchSupported = isTouchDevice();

		st.is(typeof isTouchSupported, 'boolean');

		st.end();
		
	});

	t.end();

});