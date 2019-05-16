var test = require('tape'),
	hasOwnProperty = require('@lib/hasOwnProperty');

test('hasOwnProperty', function (t) {

	t.test('should call the `Object` method instead of calling a property of an `object`', function (st) {
	
		st.isNot(hasOwnProperty({

			'hasOwnProperty': function () {
				return 'custom';
			}

		}, 'property'), 'custom');

		st.end();
	
	});

});