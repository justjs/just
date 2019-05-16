var test = require('tape'),
	parseUrl = require('@lib/parseUrl');

test('parseUrl', function (t) {
	
	var location = window.location;

	t.test('should parse absolute urls', function (st) {

		st.deepEquals(parseUrl(location.href), location);

		st.end();

	});

	t.test('should parse relative urls', function (st) {

		var relativeUrl = '/?a#c?d';

		st.deepEquals(parseUrl(relativeUrl), Object.assign({}, location, {
			'href': location.href.replace(/\/$/, '') + relativeUrl,
			'pathname': '/',
			'search': '?a',
			'hash': '#c?d'
		}), 'when possible, values default to `window.location` values');

		st.end();

	});

	t.test('should parse relative blob urls', function (st) {

		var blobUrl = 'blob:';

		st.deepEquals(parseUrl(blobUrl), {
			'protocol' : 'blob:',
			'href' : 'blob:' + location.href,
			'host' : '',
			'hostname' : '',
			'port' : '',
			'pathname' : location.origin + location.pathname
		});

		st.end();

	});

	t.test('should parse `window.location` if no url is given', function (st) {
		st.deepEquals(parseUrl(), location);
		st.end();
	});

	t.test('should parse values that doesn\'t start with "/", "?", "#"', function (st) {

		st.deepEquals(parseUrl('a'), Object.assign({}, location, {
			'href': location.protocol + '://a',
			'host': 'a',
			'hostname': 'a',
			'pathname': '/',
			'origin': location.protocol + '://a'
		}), 'The url is treated as a host and filled with `window.location` values');

		st.deepEquals(parseUrl('a:b'), Object.assign({}, location, {
			'href': location.protocol + '://a:b',
			'host': 'a:b',
			'hostname': 'a:b',
			'pathname': '/',
			'origin': location.protocol + '://a'
		}), 'The whole url is treated as a host since `b` is not a `number`');

		st.end();

	});

	t.test('should translate "//" into `window.location.origin`', function (st) {

		st.deepEquals(parseUrl('//'), {
			'protocol': location.protocol,
			'href': location.origin,
			'host': location.host,
			'hostname': location.hostname,
			'port': location.port,
			'pathname': '/',
			'origin': location.origin,
			'search': '',
			'hash': '',
			'username': '',
			'password': ''
		});

		st.deepEquals(parseUrl('blob://'), {
			'protocol' : 'blob:',
			'href' : 'blob:' + location.origin,
			'host' : '',
			'hostname' : '',
			'port' : '',
			'pathname' : location.origin
		});

		st.end();

	});

});