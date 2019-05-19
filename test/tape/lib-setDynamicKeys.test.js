var test = require('tape'),
	setDynamicKeys = require('../../src/lib/setDynamicKeys');

test('setDynamicKeys', function (t) {

	t.test('should add the given values to a new object and return it', function (st) {

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

	t.test('should throw if the dynamic keys are not an array-like', function (st) {
		st.throws(setDynamicKeys({'a': 1}, 'non an array-like'), TypeError);
		st.end();
	});

	t.test('should ignore and create a new object if the first argument is not an object', function (st) {
		
		st.deepEquals(setDynamicKeys('non an object', [
			'a', 1
		]), {
			'a': 1
		});

		st.end();
	});

});