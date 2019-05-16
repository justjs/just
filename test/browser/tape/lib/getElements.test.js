var test = require('tape'),
	getElements = require('@lib/getElements');

test('getElements', function (t) {

	t.test('should return an `Array` always', function (st) {

		var div = document.createElement('div');
		var body = document.getElementsByTagName('body')[0];

		body.appendChild(div);

		st.deepEquals(getElements('div'), [div]);
		st.deepEquals(getElements('notFound'), []);

		st.end();

	});

});