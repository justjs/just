var parseUrl = require('@lib/parseUrl');

describe('@lib/parseUrl.js', function () {

    var currentLocation = JSON.parse(JSON.stringify(location));
    var nonOriginParts = {
        'pathname': '',
        'search': '',
        'hash': ''
    };

    it('Should parse absolute urls.', function () {

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

        expect(parseUrl(url)).toMatchObject(parts);

    });

    it('Should parse relative urls.', function () {

        var relativeUrl = '/?a#c?d';
        var parsedUrl = parseUrl(relativeUrl);

        /** When possible, values default to `window.location` values. */
        expect(parsedUrl).toMatchObject(Object.assign({}, currentLocation, {
            'href': currentLocation.origin + relativeUrl,
            'pathname': '/',
            'search': '?a',
            'hash': '#c?d'
        }));

    });

    it('Should parse relative blob urls.', function () {

        var blobUrl = 'blob:';
        var parsedUrl = parseUrl(blobUrl);

        expect(parsedUrl).toMatchObject(Object.assign({}, currentLocation, {
            'protocol': 'blob:',
            'href': 'blob:' + currentLocation.href,
            'host': '',
            'hostname': '',
            'port': '',
            'pathname': currentLocation.origin + currentLocation.pathname
        }));

    });

    it('Should parse `window.location` if no url is given.', function () {

        var parsedUrl = parseUrl();
        var expectedValues = Object.assign({}, currentLocation);

        /** `window.location` was parsed. */
        expect(parsedUrl).toMatchObject(expectedValues);

    });

    it('Should parse values that doesn\'t start with ' +
		'"/", "?" or "#".', function () {

        var parsedUrl;

        parsedUrl = parseUrl('a');
        /** The url is treated as a host and filled with `window.location` values. */
        expect(parsedUrl).toMatchObject(Object.assign({}, currentLocation, nonOriginParts, {
            'href': currentLocation.protocol + '//a',
            'host': 'a',
            'hostname': 'a',
            'port': '',
            'origin': currentLocation.protocol + '//a'
        }));

        parsedUrl = parseUrl('a:b');
        /** The whole url is treated as a host since `b` is not a `number`. */
        expect(parsedUrl).toMatchObject(Object.assign({}, currentLocation, nonOriginParts, {
            'href': currentLocation.protocol + '//a:b',
            'host': 'a:b',
            'hostname': 'a:b',
            'port': '',
            'origin': currentLocation.protocol + '//a:b'
        }));

    });

    it('Should translate "//" into `window.location.origin`.', function () {

        var parsedUrl;

        parsedUrl = parseUrl('//');
        expect(parsedUrl).toMatchObject(Object.assign({}, currentLocation, nonOriginParts, {
            'username': currentLocation.username || '',
            'password': currentLocation.password || '',
            'href': currentLocation.origin
        }));

        parsedUrl = parseUrl('blob://');
        expect(parsedUrl).toMatchObject(Object.assign({}, nonOriginParts, currentLocation, {
            'protocol': 'blob:',
            'href': 'blob:' + currentLocation.origin,
            'host': '',
            'hostname': '',
            'port': '',
            'pathname': currentLocation.origin
        }));

    });

});
