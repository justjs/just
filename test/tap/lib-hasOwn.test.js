var test = require('tap').test,
	hasOwn = require('../../src/lib/hasOwn');

test('lib/hasOwn.js', {'autoend': true}, function (t) {

	t.test('Should call the `Object` method instead of calling ' +
		'a property of an object.', function (st) {
	
		st.isNot(hasOwn({

			'hasOwn': function () {
				return 'custom';
			}

		}, 'property'), 'custom');

		st.end();
	
	});

});