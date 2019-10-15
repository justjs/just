var just = require('./core');
/**
 * Parses <var>url</var> without checking if it's a valid url.
 *
 * Note that this function uses <var>window.location</var> to make relative urls, so
 * weird values in there will give weird results.
 *
 * @namespace
 * @memberof just
 * @param {url} [url=window.location.href] - A relative, an absolute or a blob url.
 *
 * @example <caption>An absolute url:</caption>
 * parseUrl(window.location.href);
 *
 * @example <caption>A relative url:</caption>
 * parseUrl('/?a#c?d'); // "/" is the pathname, "?a" the search and "#c?d" the hash.
 *
 * @example <caption>A blob url:</caption>
 * parseUrl('blob:'); // Same as 'blob:' + `window.location.href`
 *
 * @example <caption>Some good-to-know urls:</caption>
 * parseUrl(); // Same as `window.location`.
 * parseUrl('a'); // Something that doesn't start with "/", "?", or "#" is evaluated as a host.
 * parseUrl('a:b'); // "a:b" is a host, since "b" is not a number.
 * parseUrl('//'); // evals as the current origin.
 * parseUrl('blob://'); // Same as 'blob:' + `window.location.origin`.
 * // [...]
 *
 * @return {url_parts}
 */
var parseUrl = function parseUrl (url) {

    var parts = {};
    var loc = window.location;
    var optionalParts, hrefParts, id, uriParts, domainParts, hostParts,
        userParts, passwordParts;
    var blob;

    url = url || loc.href;

    if (/^blob:/i.test(url)) {

        blob = parseUrl(url.replace(/^blob:/i, ''));

        return Object.assign(blob, {
            'protocol': 'blob:',
            'href': 'blob:' + blob.href,
            'host': '',
            'hostname': '',
            'port': '',
            'pathname': blob.origin + blob.pathname
        });

    }

    if (/^(:)?\/\//.test(url)) {

        url = ((url = url.replace(/^:/, '')) === '//'
            ? loc.origin
            : loc.protocol + url
        );

    }
    else if (/^(\?|#|\/)/.test(url)) {

        url = loc.origin + url;

    }
    else if (!/:\/\//.test(url)) {

        url = loc.protocol + '//' + url;

    }

    hrefParts = (url || '').split(/(\?.*#?|#.*\??).*/);
    optionalParts = (hrefParts[1] || '').split('#');
    id = optionalParts[1] || '';

    parts.search = optionalParts[0] || '';
    parts.hash = (id ? '#' + id : id);

    uriParts = (hrefParts[0] || '').split('://');

    hostParts = (uriParts[1] || '').split(/(\/.*)/);

    parts.username = '';
    parts.password = '';

    if (/@/.test(hostParts[0])) {

        userParts = hostParts[0].split('@');
        passwordParts = userParts[0].split(':');
        parts.username = passwordParts[0] || '';
        parts.password = passwordParts[1] || '';
        hostParts[0] = userParts[1];

    }

    parts.host = hostParts[0] || '';
    parts.pathname = hostParts[1] || '';

    domainParts = parts.host.split(/:([0-9]+)/);

    parts.hostname = domainParts[0] || '';
    parts.port = (typeof domainParts[1] !== 'undefined'
        ? domainParts[1]
        : ''
    );

    parts.protocol = uriParts[0] + ':';
    parts.origin = parts.protocol + '//' + parts.host;

    parts.href = (userParts
        ? parts.protocol + '//' + parts.username + ':' + parts.password + '@' + parts.host
        : parts.origin
    ) + parts.pathname + parts.search + parts.hash;

    return parts;

};

just.register({'parseUrl': parseUrl});

module.exports = parseUrl;
