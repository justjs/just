var assign = require('./assign');

/**
 * Show a warning in the console, or throw an Error if called.
 *
 * @since 1.0.0-rc.23
 * @namespace
 * @memberof just
 * @param {string} member - The member's name. E.g.: ".deprecate()"
 * @param {string} type - "warning" or "error". Otherwise it logs the error using console.error().
 * @param {?object} options
 * @param {?string} options.since - Some string.
 * @param {?string} options.message - A message to append to the default message.
 * @throws {Error} If <var>type</var> is set to "error".
 */
function deprecate (member, type, options) {

    var opts = assign({}, options || {});
    var message = ('just' + member + ' is deprecated' +
		(opts.since ? ' since ' + opts.since : '') + '. ' +
		(opts.message || '')
    ).trim();

    if (type === 'warning') { console.warn(message); }
    else if (type === 'error') { throw new Error(message); }
    else { console.error(message); }

}

module.exports = deprecate;
