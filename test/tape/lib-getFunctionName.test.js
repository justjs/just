var test = require('tape'),
	getFunctionName = require('../../src/lib/getFunctionName');

test('lib/getFunctionName.js', function (t) {

	t.test('Should throw if the given value is not a function.',
		function (st) {
		
		st.throws(function () {
			getFunctionName('not a function');
		}, TypeError);
		
		st.end();

	});

	t.test('Should use the name property if it\'s available.',
		function (st) {
		
		var fn = function realName () {};
		
		fn.name = 'someOtherName';

		st.is(getFunctionName(fn), fn.name);
		st.end();

	});

	t.test('Should return an empty string if something fails.',
		function (st) {

		var fn = function () {};

		delete fn.name;

		fn.prototype.toString = function () {
			return 'custom';
		};

		st.is(getFunctionName(fn), '');
		st.end();

	});

	t.end();

});