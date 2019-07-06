var test = require('tape'),
	elementNamespaces = require('../../src/lib/var/elementNamespaces');

test('/lib/var/elementNamespaces.js', function (t) {

	t.test('Should return all known namespaces-URIs.', function (st) {

		st.is(elementNamespaces.constructor, ({}).constructor,
			'Is a key-value object.');

		st.end();

	});

	t.end();

});