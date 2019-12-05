/**
 * Call a function when the HTML document has been loaded.
 * Source: http://youmightnotneedjquery.com/#ready
 *
 * @param {function} fn - The callback.
 */
function onDocumentReady (fn) {

    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }

}

module.exports = onDocumentReady;
