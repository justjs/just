var test = require('tape'),
	parseUrl = require('../../src/lib/parseUrl'),
	fill = require('../../src/lib/fill');

test('lib/parseUrl.js', function (t) {

	var location = Object.assign({}, window.location);

	t.test('Should parse absolute urls.', function (st) {

		var url = 'http://localhost/';

		st.deepEquals(parseUrl(url), {
			'search': '',
			'hash': '',
			'username': '',
			'password': '',
			'host': 'localhost',
			'pathname': '/',
			'hostname': 'localhost',
			'port': '',
			'protocol': 'http:',
			'origin': 'http://localhost',
			'href': url
		});

		st.end();

	});

	t.test('Should parse relative urls.', function (st) {

		var relativeUrl = '/?a#c?d';
		var parsedUrl = parseUrl(relativeUrl);

		st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, location), {
			'href': location.origin + relativeUrl,
			'pathname': '/',
			'search': '?a',
			'hash': '#c?d'
		}), 'When possible, values default to `window.location` values.');

		st.end();

	});

	t.test('Should parse relative blob urls.', function (st) {

		var blobUrl = 'blob:';
		var parsedUrl = parseUrl(blobUrl);

		st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, location), {
			'protocol' : 'blob:',
			'href' : 'blob:' + location.href,
			'host' : '',
			'hostname' : '',
			'port' : '',
			'pathname' : location.origin + location.pathname
		}));

		st.end();

	});

	t.test('Should parse `window.location` if no url is given.',
		function (st) {
		
		var parsedUrl = parseUrl();
		var expectedValues = fill(parsedUrl, location);

		st.deepEquals(
			parsedUrl,
			expectedValues,
			'`window.location` was parsed.'
		);

		st.end();

	});

	t.test('Should parse values that doesn\'t start with ' +
		'"/", "?" or "#".', function (st) {

		var parsedUrl;

		parsedUrl = parseUrl('a');
		st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, location), {
			'href': location.protocol + '//a',
			'host': 'a',
			'hostname': 'a',
			'pathname': '',
			'port': '',
			'origin': location.protocol + '//a'
		}), 'The url is treated as a host and filled with ' +
			'`window.location` values.');

		parsedUrl = parseUrl('a:b');
		st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, location), {
			'href': location.protocol + '//a:b',
			'host': 'a:b',
			'hostname': 'a:b',
			'pathname': '',
			'port': '',
			'origin': location.protocol + '//a:b'
		}), 'The whole url is treated as a host since `b` is not ' + 
			'a `number`.');

		st.end();

	});

	t.test('Should translate "//" into `window.location.origin`.',
		function (st) {

		var parsedUrl;

		parsedUrl = parseUrl('//');
		st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, location), {
			'pathname': '',
			'search': '',
			'hash': '',
			'username': '',
			'password': '',
			'href': location.origin
		}));

		parsedUrl = parseUrl('blob://');
		st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, location), {
			'protocol' : 'blob:',
			'href' : 'blob:' + location.origin,
			'host' : '',
			'hostname' : '',
			'port' : '',
			'pathname' : location.origin
		}));

		st.end();

	});

});