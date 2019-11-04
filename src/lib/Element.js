var Event = require('./Event');
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

        var tag = tagName = tagName.toLowerCase().trim();
        var namespaceURI = Element.namespaces[namespace] || Element.namespaces[tag] || namespace;

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
         * @type {Object.<string, url>}
         */
        'namespaces': {
            'html': 'http://www.w3.org/1999/xhtml',
            'mathml': 'http://www.w3.org/1998/Math/MathML',
            'svg': 'http://www.w3.org/2000/svg',
            'xlink': 'http://www.w3.org/1999/xlink',
            'xml': 'http://www.w3.org/XML/1998/namespace',
            'xmlns': 'http://www.w3.org/2000/xmlns/',
            'xbl': 'http://www.mozilla.org/xbl',
            'xul': 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'
        },
        /**
         * Create an element from a string.
         *
         * @param {!string} elementAsString - A css-selector like string.
         *     I.e., any combination of:
         *     - "tagName", "namespace:tagName", "tagName>tagName", ...
         *     - "tagName[attribute]", "tagName[attribute=some value]", "tagName[attribute=\"value\"]", ...
         *     - "tagName.class", ...
         *     - "tagName#id", ...
         *     - "tagName>>text", ...
         *
         * @example <caption>Create an Element.</caption>
         * create('div'); // A &lt;div&gt;.
         * create('something'); // A &lt;something&gt;.
         *
         * @example <caption>Create an Element within a namespace.</caption>
         * create('svg'); // Element.namespaces['svg'] is implied.
         * create('http://www.w3.org/1999/xhtml:div'); // http://www.w3.org/1999/xhtml
         *
         * @example <caption>Create a Text Node.</caption>
         * create('>text'); // Text Node with "text" as text.
         *
         * @example <caption>Create a nested Element.</caption>
         * create('div>span'); // &lt;span&gt; within a &lt;div&gt;.
         * create('div>div>span'); // &lt;span&gt; within a &lt;div&gt; within a &lt;div&gt;.
         *
         * @example <caption>Create nested Text Node. --Note the double ">".</caption>
         * create('span>>text'); // Creates a &lt;span&gt; with "text" as text. Returns the Text Node.
         * create('div>>span>b'); // Creates a &lt;div&gt; with "span>b" as text. Returns the Text Node.
         *
         * @example <caption>Create an Element with an id.</caption>
         * create('div#id'); // &lt;div&gt; with "id" as id.
         * create('div#id#id2'); // &lt;div&gt; with "id2" as id. (The latest takes precedence).
         *
         * @example <caption>Create an Element with a class.</caption>
         * create('div.class'); // &lt;div&gt; with "class" as class name.
         * create('div.class.class2'); // &lt;div&gt; with "class" and "class2" as classes.
         *
         * @example <caption>Create an Element with an attribute.</caption>
         * create('div[hidden]'); // &lt;div&gt; with "hidden" as attribute.
         * create('div[title="x"]'); // &lt;div&gt; with "title" (equal to "x") as attribute.
         * create('div[title='single quotes']'); // &lt;div&gt; with "title" (equal to "single quotes") as attribute.
         * create('div[title=without quotes]'); // &lt;div&gt; with "title" (equal to "without quotes") as attribute.
         * create('div[title="x"][title="y"]'); // &lt;div&gt; with "title" (equal to "y") as attribute. (The latest takes precedence).
         * create('a[xlink:href="url"]'); // &lt;a&gt; with "href" (of the "xlink" namespace, equal to "url") as attribute.
         *
         * @example <caption>Create nested Elements with custom specifications.</caption>
         * create('div.parent#div.wrapper[data-tag="div"]>span#span[data-tag="span"]>>Some text.');
         *
         * @return {Node} The latest created Element.
         */
        'create': function (elementAsString) {

            var specifications = defaults(elementAsString, '').split(/(?:>>|^>)/);
            var elementsSpecifications = specifications[0];
            var elementText = specifications[1] || '';
            var ElementProto = Element.prototype;
            var deepestChild;

            elementsSpecifications.split('>').forEach(function (specification) {

                // Split conflictive parts.
                var tag = specification.split('[')[0];
                // Split namespace:tagName.
                var tagParts = tag.match(/(.+):(.+)/);
                var tagNamespace = tagParts ? tagParts[1] : null;
                // Remove extra characters from the tag name, like: #id, .class, [attribute]...
                var tagName = ((tagParts ? tagParts[2] : tag).match(/^[^#.[]+/) || [])[0];
                var element;

                if (!tagName) { return; }

                element = createElement(tagName, tagNamespace);

                (specification.match(/(#[^#.[]+|\.[^#.[]+|\[[^\]]+\])/g) || []).forEach(function (
                    attribute) {

                    var attributes = {};
                    var attributeParts, attributeName, attributeValue;

                    if (attribute[0] === '#') { element.id = attribute.slice(1); }
                    else if (attribute[0] === '.') { element.classList.add(attribute.slice(1)); }
                    else /*if (attribute[0] === '[') */{

                        attributeParts = attribute.match(/\[([^=]+)(?:=([^\]]*))?\]/);
                        attributeName = attributeParts[1];
                        attributeValue = (attributeParts[2] || '').replace(/(^['"]|['"]$)/g, '');
                        attributes[attributeName] = attributeValue;

                        ElementProto.setAttributes.call([element], attributes);

                    }

                });

                if (deepestChild) { deepestChild.appendChild(element); }
                deepestChild = element;

            });
            var textNode;

            if (elementText) {

                textNode = document.createTextNode(elementText);
                if (deepestChild) { deepestChild.appendChild(textNode); }
                deepestChild = textNode;

            }

            return deepestChild;

        },
        /**
         * @namespace just.Element
         * @borrows just.findElements as findAll
         */
        'findAll': findElements,
        /**
         * Find the first element using {@link just.findElements}.
         *
         * @returns {Element} The first element returned by {@link just.findElements}.
         */
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

            [].forEach.call(this,
                function (element) { element.textContent = text; }
            );

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

                    var attributeParts = name.match(/(.+):(.+)/) || [];
                    var namespace = attributeParts[1];
                    var localName = attributeParts[2];
                    var namespaceURI = Element.namespaces[namespace];

                    /* eslint-disable padded-blocks */
                    if (namespaceURI) {
                        this.setAttributeNS(namespaceURI, namespace + ':' + localName, value);
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

                var jNewElement = new Element(Element.create(tagName)).copy(target, copyOptions).get();

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
