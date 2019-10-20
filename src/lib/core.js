/* eslint-disable no-unused-vars */

/**
 * An absolute, relative or blob url.
 *
 * @typedef {string} url
 * @global
 */

/**
 * The full parts of an url.
 *
 * @typedef {Object} url_parts
 * @property {string} protocol - A protocol (including ":", like "ftp:") or ":".
 * @property {string} href - An absolute url (like "ftp://username:password@www.example.com:80/a?b=1#c").
 * @property {string} host - The host (like "www.example.com:80") or an empty string.
 * @property {string} hostname - A hostname (like "www.example.com").
 * @property {string} port - The GIVEN port as a number (like "80") or an empty string.
 * @property {string} pathname - A pathname (like "/a").
 * @property {string} origin - The origin (like "ftp://www.example.com").
 * @property {string} search - The query arguments (including "?", like "?b=1") or an empty string.
 * @property {string} hash - The hash (including '#', like "#c") or an empty string.
 * @property {string} username - The given username or an empty string.
 * @property {string} password - The given password or an empty string.
 */

/**
 * Same as the second param for <var>Object.defineProperties</var>
 *
 * @typedef {!object} propertiesDescriptor
 * @global
 */

/**
 * Same as the third param for <var>Object.defineProperty</var>
 *
 * @typedef {!object} propertyDescriptor
 * @global
 */

/**
 * A tagName of an Element (such as "link").
 *
 * @typedef {string} element_tag
 */

/**
 * @mixin just
 * @global
 */
var just = {};
var set = function registerMember (name, value) { Object.defineProperty(just, name, {'value': value}); }

set('register', set);
