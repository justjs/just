var test = require('tape'),
	self = require('../../src/lib/var/self');

test('/lib/var/self.js', function (t) {

	t.test('Should be a key-value object.', function (st) {
		
		st.is(self.constructor, ({}).constructor);

		st.end();

	});

	t.end();

});