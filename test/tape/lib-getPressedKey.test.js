var test = require('tape'),
	getPressedKey = require('../../src/lib/getPressedKey');

test('lib/getPressedKey.js', function (t) {

	t.test('Should get one of the supported variants for a key ' +
		'when a keyboard event is fired.', function (st) {

		// Doesn't matter if it's not an Event.
		var simulatedEvent = {'key': 'Enter'};
		var key = getPressedKey(simulatedEvent);

		st.is(/^(Enter|13)$/.test(key), true, 'It can be checked ' +
			'against a regexp.');

		st.isNot(['Enter', 13].indexOf(key), -1, 'It can be checked ' +
			'against an Array.');
		
		st.end();

	});

	t.end();

});