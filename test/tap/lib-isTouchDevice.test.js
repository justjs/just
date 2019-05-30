var test = require('tap').test,
	isTouchDevice = require('../../src/lib/isTouchDevice');

test('lib/isTouchDevice.js', {'autoend': true}, function (t) {

	t.test('Should check for touch support.', function (st) {

		var isTouchSupported = isTouchDevice();

		st.is(typeof isTouchSupported, 'boolean');

		st.end();
		
	});

});