var test = require('tape'),
	hasOwn = require('../../src/lib/hasOwn');

test('hasOwn', function (t) {

	t.test('should call the `Object` method instead of calling a property of an `object`', function (st) {
	
		st.isNot(hasOwn({

			'hasOwn': function () {
				return 'custom';
			}

		}, 'property'), 'custom');

		st.end();
	
	});

});