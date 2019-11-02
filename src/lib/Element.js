var Event = require('./Event');
var toObjectLiteral = require('./toObjectLiteral');
var isWindow = require('./isWindow');
var defineProperties = require('./defineProperties');
var findElements = require('./findElements');
var defaults = require('./defaults');
var eachProperty = require('./eachProperty');
var check = require('./check');
var getRemoteParent = require('./getRemoteParent');
var access = require('./access');
var Element = (function () {

    'use strict';

    var getResults = function (array, fn) {

        var results = [].map.call(array, fn, array);

        return results.length === 1 ? results[0] : results;

    };
    var createElement = function (tagName, namespace) {

        var namespaceURI = Element.NAMESPACES[namespace] || Element.NAMESPACES[tagName = tagName.toLowerCase().trim()] || namespace;

        return (namespaceURI
            ? document.createElementNS(namespaceURI, tagName)
            : document.createElement(tagName)
        );

    };
    var createBounds = function (position, size) {

        var x = defaults(position.x, position.left || 0);
        var y = defaults(position.y, position.top || 0);
        var width = defaults(size.width, 0);
        var height = defaults(size.height, 0);

        return {
            'x': x,
            'y': y,
            'left': x,
            'top': y,
            'width': width,
            'height': height,
            'bottom': y + height,
            'right': x + width
        };

    };
    var getWindowBounds = function () {

        var html = document.documentElement;
        var position = {
            'x': window.scrollX || window.pageXOffset || html.scrollLeft,
            'y': window.scrollY || window.pageYOffset || html.scrollTop
        };
        var size = {
            'width': window.innerWidth || html.clientWidth,
            'height': window.innerHeight || html.clientHeight
        };

        return createBounds(position, size);

    };
    var getDocumentBounds = function () {

        var html = document.documentElement;
        var body = document.body;
        var position = {
            'x': 0,
            'y': 0
        };
        var size = {
            'width': Math.max(
                body.scrollWidth,
                body.offsetWidth,
                html.clientWidth,
                html.scrollWidth,
                html.offsetWidth
            ),
            'height': Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            )
        };

        return createBounds(position, size);

    };

    function Element (elements) {

        /* eslint-disable padded-blocks */
        if (!(this instanceof Element)) {
            return new Element(elements);
        }

        if (elements instanceof Element) {
            return elements;
        }

        if (typeof elements === 'undefined') {
            elements = [];
        }
        else if (typeof elements === 'string') {
            elements = Element.findAll(elements);
        }
        else if (elements instanceof Node || isWindow(elements)) {
            elements = [elements];
        }
        else if (!Array.isArray(elements)) {
            throw new TypeError(elements + ' should be either an string, an array or a Node.');
        }

        if (this.constructor === Element) {
            this.length = [].push.apply(this, elements);
        }
        /* eslint-enable padded-blocks */

        Event.call(this);

    }

    defineProperties(Element, {

        /**
         * Namespace uris for known tags.
         *
         * @memberof just
         * @type {Object.<element_tag, url>}
         */
        'NAMESPACES': Object.freeze({
            'html': 'http://www.w3.org/1999/xhtml',
            'mathml': 'http://www.w3.org/1998/Math/MathML',
            'svg': 'http://www.w3.org/2000/svg',
            'xlink': 'http://www.w3.org/1999/xlink',
            'xml': 'http://www.w3.org/XML/1998/namespace',
            'xmlns': 'http://www.w3.org/2000/xmlns/',
            'xbl': 'http://www.mozilla.org/xbl',
            'xul': 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'
        }),
        'createElement': function (elementAsString) {

            var tagName = (elementAsString.match(/(^|\t+)[a-z0-9\s]+/i) || [''])[0].trim();
            var stringParts = elementAsString.split('>');
            var namespace = '';
            var attributes = stringParts[0].replace(/:(\.*);/, function (_, ns) {

                namespace = ns;

                return '';

            });
            var text = stringParts[1] || '';
            var jElement, element;

            /* eslint-disable padded-blocks */
            if (!tagName) {
                return document.createTextNode(text);
            }
            /* eslint-enable padded-blocks */

            jElement = new Element(createElement(tagName, namespace));
            element = jElement.get();

            // FIX: Backreference didn't work on quotes.
            attributes = attributes.replace(/\[\s*([\w\-:]+)(\s*=\s*("([^"]*)"|'([^"]*)')\s*)?\]/g, function replaceAttribute (regexp, name, quoted, attributeValue, valueDoubleQuotes, valueSingleQuotes) {

                jElement.setAttributes(toObjectLiteral([
                    name, attributeValue ? (valueDoubleQuotes || valueSingleQuotes) : true
                ]), namespace);

                return '';

            }).trim();

            attributes = attributes.replace(/\[\s*([\w-]+)\s*=\s*("(\{.+\})"|'(\{.+\})')\s*\]/, function replaceJSONAttribute (_, name, value, json) {

                jElement.setAttributes(toObjectLiteral([
                    name, json
                ]), namespace);

                return '';

            });

            attributes = attributes.replace(/\.([\w-]+)/g, function replaceClass (_, name) {

                element.classList.add(name);

                return '';

            }).trim();

            attributes = attributes.replace(/#([\w-]+)/g, function replaceID (_, id) {

                element.id = id;

                return '';

            }).trim();

            jElement.setText(text);

            return element;

        },
        'findAll': function (selector, parent) {

            return findElements(selector, parent);

        },
        'find': function (selector, parent) {

            return findElements(selector, parent)[0];

        }
    });

    Element.prototype = Object.assign(Object.create(Event.prototype), Element.prototype, {

        'get': function (handler) {

            return getResults(this, function (element, i) {

                return (typeof handler === 'function'
                    ? handler.call(element, new Element(element), i, this)
                    : element
                );

            });

        },
        'each': function (fn) {

            return this.get(fn), this;

        },
        'setText': function (text) {

            text = defaults(text, '');

            [].forEach.call(this, function (element) {

                if ('textContent' in element) {

                    element.textContent = text;

                }
                else if ('innerText' in element) {

                    element.innerText = text;

                }

            });

            return this;

        },
        'getText': function () {

            return getResults(this, function (element) {

                return (
                    'textContent' in element ? element.textContent
                    : 'innerText' in element ? element.innerText
                    : ''
                );

            });

        },
        /**
         *
         * @returns {Object} top, left, right, bottom,
         *      width, height, x and y.
         */
        'getBounds': function () {

            return getResults(this, function (element) {

                var bounds;

                /* eslint-disable padded-blocks */
                if (isWindow(element)) {
                    return getWindowBounds();
                }

                if (/^html$/i.test(element.tagName)) {
                    return getDocumentBounds();
                }
                /* eslint-enable padded-blocks */

                try { bounds = element.getBoundingClientRect(); }
                catch (exception) { /* unspecified error IE11 (?) */ }

                return createBounds(bounds, {
                    'width': bounds.width || (bounds.right - bounds.left),
                    'height': bounds.height || (bounds.bottom - bounds.top)
                });

            });

        },
        'isInsideBounds': function (bounds) {

            return getResults(this, function (target) {

                var elementBounds = new Element(target).getBounds();

                return (
                    elementBounds.bottom > 0
                    && elementBounds.right > 0
                    && elementBounds.left < bounds.width
                    && elementBounds.top < bounds.height
                );

            });

        },
        'fitInBounds': function (bounds) {

            [].forEach.call(this, function (element) {

                var ratio = Math.min(bounds.width / element.width, bounds.height / element.height);

                element.width *= ratio;
                element.height *= ratio;

            });

            return this;

        },
        'isVisible': function () {

            return getResults(this, function (element) {

                var bounds = element.getBounds();

                return !Element(element).isHidden() && !!(bounds.width || bounds.height);

            });

        },
        'isOnScreen': function () {

            return getResults(this, function (target) {

                var jElement = new Element(target);

                return jElement.isVisible() && jElement.isInsideBounds(getWindowBounds());

            });

        },
        'getAttributes': function () {

            return getResults(this, function (target) {

                var attributes = {};

                eachProperty(target.attributes, function (attribute) {

                    var key = attribute.name || attribute.nodeName;
                    var value = attribute.value || attribute.nodeValue;

                    attributes[key] = value;

                });

                return attributes;

            });

        },
        'setAttributes': function (attributes) {

            check.throwable(attributes, {});

            [].forEach.call(this, function (element) {

                eachProperty(attributes, function (value, name) {

                    var namespace = name.split(':')[0];
                    var namespaceURI = Element.NAMESPACES[namespace];

                    /* eslint-disable padded-blocks */
                    if (namespaceURI) {
                        this.setAttributeNS(namespaceURI, name.split(':')[1], value);
                    }
                    else {
                        this.setAttribute(name, value);
                    }
                    /* eslint-enable padded-blocks */

                }, element);

            });

            return this;

        },
        'replaceAttributes': function (attributes, allowEmptyValues) {

            [].forEach.call(this, function (element) {

                eachProperty(attributes, function (newName, name) {

                    var value = this.getAttribute(name) || '';

                    if (!value && !allowEmptyValues) { return; }

                    this.removeAttribute(name);
                    this.setAttribute(newName, value);

                }, element);

            });

            return this;

        },
        'removeAttributes': function (attribute) {

            var attributes = [].slice.call(arguments);

            [].forEach.call(this, function (element) {

                attributes.forEach(function (name) {

                    this.removeAttribute(name);

                }, element);

            });

            return this;

        },
        'cloneAttributes': function (target) {

            return this.setAttributes(
                new Element(target).getAttributes()
            );

        },
        'find': function (selector) {

            return new Element(getResults(this,
                function (parent) { return Element.find(selector, parent); }
            ));

        },
        'findAll': function (selector) {

            return new Element(getResults(this,
                function (parent) { return Element.findAll(selector, parent); }
            ));

        },
        'clone': function (options) {

            var deep = defaults((options = defaults(options, {})).deep, true);

            return new Element(getResults(this, function (target) {

                return new Element(target.cloneNode(deep)).copy(target, {
                    'ignoreAttributes': true,
                    'ignoreText': true
                }).get();

            }));

        },
        'remove': function () {

            [].forEach.call(this,
                function (target) { target.parentNode.removeChild(target); }
            );

            return this;

        },
        'removeChildren': function () {

            [].forEach.call(this, function (target) {

                while (target.firstChild) {

                    target.removeChild(target.firstChild);

                }

            });

            return this;

        },
        'isHidden': function () {

            return getResults(this,
                function (target) { return target.parentNode === null || target.getAttribute('hidden') !== null; }
            );

        },
        'replaceWith': function (newElement) {

            return new Element(getResults(this, function (target) {

                target.parentNode.replaceChild(newElement, target);

                return newElement;

            }, Element));

        },
        'copy': function (target, options) {

            options = defaults(options, {});

            [].forEach.call(this, function (element) {

                element = Element(element);

                /* eslint-disable padded-blocks */
                if (!options.ignoreAttributes) {
                    element.cloneAttributes(target);
                }

                if (!options.ignoreEvents) {
                    element.cloneEvents(target);
                }

                if (!options.ignoreProperties) {
                    element.cloneProperties(target);
                }

                if (!options.ignoreText) {
                    element.setText(Element(target).getText());
                }
                /* eslint-enable padded-blocks */

            });

            return this;

        },
        'replaceTag': function (tagName, copyOptions) {

            return new Element(getResults(this, function (target) {

                var jNewElement = new Element(Element.createElement(tagName)).copy(target, copyOptions).get();

                return new Element(target).replaceWith(jNewElement).get();

            }));

        },
        'getRemoteParent': function (fn) {

            return new Element(getResults(this, function (element) {

                return getRemoteParent(element, fn);

            }));

        }
    }, {
        'accessToProperty': function (path, fn) {

            [].forEach.call(this, function (element) {

                access(element.justElement, path, fn);

            });

            return this;

        },
        'setProperty': function (path, value) {

            this.accessToProperty(path, function (v, k) {

                v[k] = value;

            });

            return this;

        },
        'getProperty': function (path) {

            return this.accessToProperty(arguments, function (v, k, exists) {

                return exists ? v[k] : void 0;

            });

        },
        'hasProperty': function (path) {

            return this.accessToProperty(arguments, function (v, k, exists) {

                return exists;

            });

        },
        'removeProperty': function (path) {

            this.accessToProperty(arguments, function (v, k) {

                delete v[k];

            });

            return this;

        },
        'getAllProperties': function () {

            return getResults(this, function (element) {

                return Object.assign({}, element.justElement);

            });

        },
        'cloneProperties': function (target) {

            var targetProperties = Object.assign({}, target.justElement);

            [].forEach.call(this, function (element) {

                Object.assign(element.justElement, targetProperties);

            });

            return this;

        }
    }, {'constructor': Element});

    return Element;

})();

module.exports = Element;
