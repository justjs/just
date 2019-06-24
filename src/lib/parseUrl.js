define(['./core'], function (APR) {

	'use strict';

	/**
	 * The full parts of an url.
	 * 
	 * @typedef {Object} APR~urlParts
	 * @property {string} protocol A protocol (including ":", like "ftp:") or ":".
	 * @property {string} href An absolute url (like "ftp://username:password@www.example.com:80/a?b=1#c").
	 * @property {string} host The host (like "www.example.com:80") or an empty string.
	 * @property {string} hostname A hostname (like "www.example.com").
	 * @property {string} port The GIVEN port as a number (like "80") or an empty string.
	 * @property {string} pathname A pathname (like "/a").
	 * @property {string} origin The origin (like "ftp://www.example.com").
	 * @property {string} search The query arguments (including "?", like "?b=1") or an empty string.
	 * @property {string} hash The hash (including '#', like "#c") or an empty string.
	 * @property {string} username The given username or an empty string.
	 * @property {string} password The given password or an empty string.
	 */

	/**
	 * Parses `url` without checking if it's a valid url.
	 * 
	 * Note that this function uses `window.location` to make relative urls, so
	 * weird values in there will give weird results.
	 * 
	 * @param {string} [url=window.location.href] A relative, an absolute or a blob url.
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
	 * @return {APR~urlParts} 
	 */
	return APR.setFn('parseUrl', function parseUrl (url) {
		
		var parts = {}, optionalParts, hrefParts, args, id, uriParts, domainParts, hostParts, userParts, passwordParts;
		var location = Object.assign({}, window.location);
		var blob;

		url = url || location.href;

		if (/^blob\:/i.test(url)) {
			
			blob = parseUrl(url.replace(/^blob\:/i, ''));
			
			return Object.assign(blob, {
				'protocol': 'blob:',
				'href': 'blob:' + blob.href,
				'host': '',
				'hostname': '',
				'port': '',
				'pathname': blob.origin + blob.pathname
			});

		}

		if (/^(\:)?\/\//.test(url)) {
			url = ((url = url.replace(/^\:/, '')) === '//'
				? location.origin
				: location.protocol + url
			);
		}
		else if (/^(\?|\#|\/)/.test(url)) {
			url = location.origin + url;
		}
		else if (!/\:\/\//.test(url)) {
			url = location.protocol + '//' + url;
		}

		hrefParts = url.split(/(\?.*#?|#.*\??).*/);
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

	});

});