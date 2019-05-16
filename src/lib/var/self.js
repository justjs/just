define(function () {

	'use strict';

	/**
	 * Returns a ready-to-load URL for an APR file.
	 * 
	 * @typedef {function} APR~self_setFileUrl
	 * @param {string} name The name of the file.
	 * @param {string} ext The file extension.
	 * @param {(string|number)} [version=""] The version of the file.
	 * @return {string}
	 */

	/**
	 * Useful values related with the script itself.
	 *  
		 * @property {string} originUrl The origin of the URL that contains other than static content.
		 * @property {string} staticOriginUrl The origin of the URL that serves APR's files.
	 * @property {APR~self_setFileUrl} setFileUrl Sets the url of APR's files.
	 */
	return Object.create({
		'originUrl': 'https://www.aprservices.com',
		'staticOriginUrl': 'https://www.code.aprservices.com',
		'setFileUrl': function (name, ext, version) {
			return this.staticOriginUrl + '/' + ext + '/' + name + '/dev/' + version + '.' + ext + '?nocache=true'
		}
	});

});