var test = require('tape');
var parseUrl = require('../../src/lib/parseUrl');
var options = {'skip': typeof window === 'undefined'};

// TODO: Mock
test('lib/parseUrl.js', options, function (t) {

    var fill = require('../../src/lib/fill');
    var currentLocation = Object.assign({}, location, {
        'origin': location.origin
    });
    var nonOriginParts = {
        'pathname': '',
        'search': '',
        'hash': ''
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

        st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, currentLocation), {
            'href': currentLocation.origin + relativeUrl,
            'pathname': '/',
            'search': '?a',
            'hash': '#c?d'
        }), 'When possible, values default to `window.location` values.');

        st.end();

    });

    t.test('Should parse relative blob urls.', function (st) {

        var blobUrl = 'blob:';
        var parsedUrl = parseUrl(blobUrl);

        st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, currentLocation), {
            'protocol': 'blob:',
            'href': 'blob:' + currentLocation.href,
            'host': '',
            'hostname': '',
            'port': '',
            'pathname': currentLocation.origin + currentLocation.pathname
        }));

        st.end();

    });

    t.test('Should parse `window.location` if no url is given.', function (st) {

        var parsedUrl = parseUrl();
        var expectedValues = fill(parsedUrl, currentLocation);

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
        st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, currentLocation), nonOriginParts, {
            'href': currentLocation.protocol + '//a',
            'host': 'a',
            'hostname': 'a',
            'port': '',
            'origin': currentLocation.protocol + '//a'
        }), 'The url is treated as a host and filled with ' +
			'`window.location` values.');

        parsedUrl = parseUrl('a:b');
        st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, currentLocation), nonOriginParts, {
            'href': currentLocation.protocol + '//a:b',
            'host': 'a:b',
            'hostname': 'a:b',
            'port': '',
            'origin': currentLocation.protocol + '//a:b'
        }), 'The whole url is treated as a host since `b` is not ' +
			'a `number`.');

        st.end();

    });

    t.test('Should translate "//" into `window.location.origin`.', function (st) {

        var parsedUrl;

        parsedUrl = parseUrl('//');
        st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, currentLocation), nonOriginParts, {
            'username': currentLocation.username || '',
            'password': currentLocation.password || '',
            'href': currentLocation.origin
        }));

        parsedUrl = parseUrl('blob://');
        st.deepEquals(parsedUrl, Object.assign(fill(parsedUrl, nonOriginParts, currentLocation), {
            'protocol': 'blob:',
            'href': 'blob:' + currentLocation.origin,
            'host': '',
            'hostname': '',
            'port': '',
            'pathname': currentLocation.origin
        }));

        st.end();

    });

    t.end();

});
