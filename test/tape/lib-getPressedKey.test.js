var test = require('tape'),
	getPressedKey = require('../../src/lib/getPressedKey');

test('lib/getPressedKey.js', function (t) {

	t.test('should get one of the supported variants for a key when a keyboard event is fired.', function (st) {

		var simulatedEvent = document.createEvent('KeyboardEvent');

		st.plan(2);

		document.addEventListener('keypress', function (e) {
			
			var key = getPressedKey(e);

			st.is(/^(Enter|13)$/.test(key), true, 'It can be checked against a regexp');
			st.isNot(['Enter', 13].indexOf(key), -1, 'It can be checked against an Array');

		});

		simulatedEvent.key = 'Enter';
		(simulatedEvent.initKeyboardEvent || simulatedEvent.initKeyEvent)();

	});

});