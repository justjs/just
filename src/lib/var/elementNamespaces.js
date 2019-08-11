define(['../core'], function (APR) {

	'use strict';

	return APR.setProperty('elementNamespaces', /** @lends APR */
	/**
	 * Namespace uris for known tags.
	 *
	 * @property {{APR~element_tag, string}} - A tag with a namespace URI.
	 */
	{
		'value': {
			'html': 'http://www.w3.org/1999/xhtml',
			'mathml': 'http://www.w3.org/1998/Math/MathML',
			'svg': 'http://www.w3.org/2000/svg',
			'xlink': 'http://www.w3.org/1999/xlink',
			'xml': 'http://www.w3.org/XML/1998/namespace',
			'xmlns': 'http://www.w3.org/2000/xmlns/',
			'xbl': 'http://www.mozilla.org/xbl',
			'xul': 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'
		}
	});

});