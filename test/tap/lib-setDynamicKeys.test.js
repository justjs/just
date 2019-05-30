var test = require('tap').test,
	setDynamicKeys = require('../../src/lib/setDynamicKeys');

test('lib/setDynamicKeys.js', {'autoend': true}, function (t) {

	t.test('Should add the given values to a new object and return ' +
		'it.', function (st) {

		var b = 'b', c = 'c';

		st.deepEquals(setDynamicKeys({
			'a': 1
		}, [
			b, 2,
			c, 3
		]), {
			'a': 1,
			'b': 2,
			'c': 3
		});

		st.end();

	});

	t.test('Should throw if the dynamic keys are not an array-like.',
		function (st) {
	
		st.throws(setDynamicKeys({
			'a': 1
		}, 'non an array-like'), TypeError);
		
		st.end();

	});

	t.test('Should ignore and create a new object if the first ' +
		'argument is not an object', function (st) {
		
		st.deepEquals(setDynamicKeys('non an object', [
			'a', 1
		]), {
			'a': 1
		});

		st.end();
	});

});