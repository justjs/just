var test = require('tape'),
	inheritFrom = require('../../src/lib/inheritFrom.js');

test('lib/inheritFrom.js', function (t) {

	t.test('Should inherit properties from a target.', function (st) {

		function Animal () {}
		function Dog () {}
		
		st.is(inheritFrom(Animal, Dog), Animal);
		st.is(new Dog() instanceof Animal, true);
		st.end();

	});

	t.end();

});