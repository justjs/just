var test = require('tape'),
	DNT = require('../../src/lib/var/DNT');

test('/lib/var/DNT.js', function (t) {

	t.test('Should return the DoNotTrack header on a common format.', function (st) {

		st.is(/boolean|undefined/.test(typeof DNT), true);
		st.end();

	});

	t.end();

});