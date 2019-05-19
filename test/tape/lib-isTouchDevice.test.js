var test = require('tape'),
	isTouchDevice = require('../../src/lib/isTouchDevice');

test('isTouchDevice', function (t) {

	t.test('should check for touch support', function (st) {

		var isTouchSupported = isTouchDevice();

		st.is(typeof isTouchSupported, 'boolean');

		st.end();
		
	});

	t.test('should trigger a function if a touch event is fired', function (st) {

		st.plan(1);

		isTouchDevice(function (event) {
			st.true(event instanceof Event);
		});

		document.createEvent('TouchEvent').initTouchEvent();

	});

});