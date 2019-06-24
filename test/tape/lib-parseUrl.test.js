var test = require('tape'),
	parseUrl = require('../../src/lib/parseUrl'),
	fill = require('../../src/lib/fill');

test('lib/parseUrl.js', function (t) {

	var location = Object.assign({}, window.location);
	var nonOriginParts = {
		'pathname': '',
		'search': '',
		'hash': '',
	};

	t.test('Should parse absolute urls.', function (st) {

		var parts = {
			'protocol': 'http:',
			'username': 'user',
			'password': 'pass',
			'hostname': 'localhost',
			'port': '8080',
			'pathname': '/test',
			'search': '?tape=1',
			'hash': '#testing-with-tape'
		};
		var url = parts.protocol + '//' +
			parts.username + ':' + parts.password + '@' +
			parts.hostname + ':' + parts.port +
			parts.pathname + parts.search + parts.hash;

		parts.host = parts.hostname + ':' + parts.port;
		parts.origin = parts.protocol + '//' + parts.host;
		parts.href = url;

		st.deepEquals(parseUrl(url), parts);

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
		st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, location), nonOriginParts, {
			'href': location.protocol + '//a',
			'host': 'a',
			'hostname': 'a',
			'port': '',
			'origin': location.protocol + '//a'
		}), 'The url is treated as a host and filled with ' +
			'`window.location` values.');

		parsedUrl = parseUrl('a:b');
		st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, location), nonOriginParts, {
			'href': location.protocol + '//a:b',
			'host': 'a:b',
			'hostname': 'a:b',
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
		st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, location), nonOriginParts, {
			'username': location.username || '',
			'password': location.password || '',
			'href': location.origin
		}));

		parsedUrl = parseUrl('blob://');
		st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, nonOriginParts, location), {
			'protocol': 'blob:',
			'href': 'blob:' + location.origin,
			'host': '',
			'hostname': '',
			'port': '',
			'pathname': location.origin
		}));

		st.end();

	});

});