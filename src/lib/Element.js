var JEvent = require('./Event');
var isWindow = require('./isWindow');
var defineProperties = require('./defineProperties');
var findElements = require('./findElements');
var defaults = require('./defaults');
var eachProperty = require('./eachProperty');
var check = require('./check');
var getRemoteParent = require('./getRemoteParent');
var access = require('./access');
var toObjectLiteral = require('./toObjectLiteral');
var JElement = (function () {

    'use strict';

    var createElement = function (tagName, namespace) {

        var tag = tagName = tagName.toLowerCase().trim();
        var namespaceURI = JElement.namespaces[namespace] || JElement.namespaces[tag] || namespace;

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

    /**
     * Chainable methods for Elements.
     *
     * @namespace
     * @alias just.Element
     *
     * @param {Element[]|just.Element|DOMString|undefined} elements - If given,
     *     an array of elements, an instance of {@link just.Element} or a css selector.
     */
    function JElement (elements) {

        /* eslint-disable padded-blocks */
        if (!(this instanceof JElement)) {
            return new JElement(elements);
        }

        if (elements instanceof JElement) {
            return elements;
        }

        if (typeof elements === 'undefined') {
            elements = [];
        }
        else if (typeof elements === 'string') {
            elements = JElement.findAll(elements);
        }
        else if (elements instanceof Node || isWindow(elements)) {
            elements = [elements];
        }
        else if (!Array.isArray(elements)) {
            throw new TypeError(elements + ' should be either an string, an array or a Node.');
        }

        if (this.constructor === JElement) {
            this.length = [].push.apply(this, elements);
        }
        /* eslint-enable padded-blocks */

        JEvent.call(this);

    }

    JElement.prototype = Object.assign(
        Object.create(JEvent.prototype),
        JElement.prototype,
        {'constructor': JElement}
    );

    defineProperties(JElement, /** @lends just.Element */{

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

            var JElementProto = JElement.prototype;
            var specifications = defaults(elementAsString, '').split(/(?:>>|^>)/);
            var elementsSpecifications = specifications[0];
            var elementText = specifications[1] || '';
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

                        JElementProto.setAttributes.call([element], attributes);

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
         * @mixin just
         * @borrows just.findElements as findAll
         */
        'findAll': findElements,
        /**
         * Find the first element using {@link just.findElements}.
         *
         * @param {DOMString} selector
         * @param {Node} parent
         * @returns {Element} The first element returned by {@link just.findElements}.
         */
        'find': function (selector, parent) { return findElements(selector, parent)[0]; }

    });

    defineProperties(JElement.prototype, /** @lends just.Element.prototype */{

        /**
         * A function to call on each element found.
         * @typedef {function} just.Element#get_handler
         * @this {Element}
         * @param {just.Element} jElement - An instance of {@link just.Element}
         *     with the current Element.
         * @param {number} i - The current index.
         * @param {*} this - The current context.
         * @return {*}
         */

        /**
         * Return all unwrapped elements.
         *
         * @param {just.Element#get_handler} - A function to call before values
         *     get returned.
         * @return {Element[]}
         */
        'get': function (handler) {

            var isHandlerAFn = typeof handler === 'function';

            return [].map.call(this, function (element, i) {

                return (isHandlerAFn
                    ? handler.call(element, new JElement(element), i, this)
                    : element
                );

            }, this);

        },
        /**
         * Same as {@link just.Element#get} but chainable.
         * @param {just.Element#get_handler} fn
         * @chainable
         */
        'each': function (fn) {

            JElement.prototype.get.call(this, fn);

            return this;

        },
        /**
         * Size of an Element.
         *
         * @typedef {object} just.Element#sizeBounds
         * @property {number} width
         * @property {number} height
         */

        /**
         * Position of an Element.
         *
         * @typedef {object} just.Element#positionBounds
         * @property {number} top
         * @property {number} left
         * @property {number} right
         * @property {number} bottom
         * @property {number} x
         * @property {number} y
         */
        /**
         * Size and position of an Element.
         *
         * @typedef {object} just.Element#bounds
         * @see {@link just.Element#positionBounds}.
         * @see {@link just.Element#sizeBounds}.
         */

        /**
         * Return the size and position of multiple elements.
         * @returns {just.Element#bounds[]}
         */
        'getBounds': function () {

            return JElement(this).get(function () {

                var bounds;

                /* eslint-disable padded-blocks */
                if (isWindow(this)) {
                    return getWindowBounds();
                }

                if (/^html$/i.test(this.tagName)) {
                    return getDocumentBounds();
                }
                /* eslint-enable padded-blocks */

                try { bounds = this.getBoundingClientRect(); }
                catch (exception) { /* unspecified error IE11 (?) */ }

                return createBounds(bounds, {
                    'width': bounds.width || (bounds.right - bounds.left),
                    'height': bounds.height || (bounds.bottom - bounds.top)
                });

            });

        },
        /**
         * Check if the given <var>bounds</var> are within the given elements.
         *
         * @param {just.Element#bounds} bounds - The target position.
         * @return {boolean[]}
         */
        'isInsideBounds': function (bounds) {

            return JElement(this).get(function (jElement) {

                var elementBounds = jElement.getBounds();

                return (
                    elementBounds.bottom > 0
                    && elementBounds.right > 0
                    && elementBounds.left < bounds.width
                    && elementBounds.top < bounds.height
                );

            });

        },
        /**
         * Resize multiple elements to fit inside the given <var>sizeBounds</var>.
         * @param {just.Element#sizeBounds} [sizeBounds={width: 0, height: 0}] - The maximum size.
         * @chainable
         */
        'fitInBounds': function (sizeBounds) {

            var maxSize = defaults(sizeBounds, {
                'width': 0,
                'height': 0
            });

            return JElement(this).get(function () {

                var ratio = Math.min(maxSize.width / this.width, maxSize.height / this.height);

                this.width *= ratio;
                this.height *= ratio;

            });

        },
        /**
         * Check if multiple elements are visible somewhere.
         * @return {boolean[]}
         */
        'isVisible': function () {

            return JElement(this).get(function (jElement) {

                var bounds = jElement.getBounds();

                return !jElement.isHidden() && !!(bounds.width || bounds.height);

            });

        },
        /**
         * Check if multiple elements are inside the visible area.
         * @return {boolean[]}
         */
        'isOnScreen': function () {

            return JElement(this).get(function (jElement) {

                return jElement.isVisible() && jElement.isInsideBounds(getWindowBounds());

            });

        },
        /**
         * Return all the attributes of an Element for each given Element.
         * @return {object[]}
         */
        'getAttributes': function () {

            return JElement(this).get(function () {

                var attributes = {};

                eachProperty(this.attributes, function (attribute) {

                    var key = attribute.name || attribute.nodeName;
                    var value = attribute.value || attribute.nodeValue;

                    attributes[key] = value;

                });

                return attributes;

            });

        },
        /**
         * Set namespaced and normal attributes to each given element.
         *
         * @throw {TypeError} If <var>attributes</var> is not an object.
         * @param {object} attributes
         * @chainable
         */
        'setAttributes': function (attributes) {

            check.throwable(attributes, {});

            return JElement(this).each(function () {

                eachProperty(attributes, function (value, name) {

                    var attributeParts = name.match(/(.+):(.+)/) || [];
                    var namespace = attributeParts[1];
                    var localName = attributeParts[2];
                    var namespaceURI = JElement.namespaces[namespace];

                    /* eslint-disable padded-blocks */
                    if (namespaceURI) {
                        this.setAttributeNS(namespaceURI, namespace + ':' + localName, value);
                    }
                    else {
                        this.setAttribute(name, value);
                    }
                    /* eslint-enable padded-blocks */

                }, this);

            });

        },
        /**
         * Replace namespaced and normal attributes of multiple Elements.
         *
         * @param {object} attributes
         * @param {boolean} [allowEmptyValues=false]
         * @chainable
         */
        'replaceAttributes': function (attributes, allowEmptyValues) {

            return JElement(this).each(function (jElement) {

                eachProperty(attributes, function (newName, name) {

                    var value = this.getAttribute(name) || '';

                    if (!value && !allowEmptyValues) { return; }

                    jElement.removeAttributes(name).setAttributes(
                        toObjectLiteral([newName, value])
                    );

                }, this);

            });

        },
        /**
         * Remove multiple attributes of multiple Elements.
         *
         * @param {Array} attributes - The name of the attributes.
         * @chainable
         */
        'removeAttributes': function (attributes) {

            attributes = defaults(attributes, [attributes]);

            return JElement(this).each(function () {

                attributes.forEach(
                    function (name) { this.removeAttribute(name); },
                    this
                );

            });

        },
        /**
         * Clone all attributes of a <var>target</var> and set them
         * to multiple Elements.
         *
         * @param {Element} target
         * @chainable
         */
        'cloneAttributes': function (target) {

            return JElement(this).setAttributes(
                JElement(target).getAttributes()
            );

        },
        /**
         * Find the first child of multiple Elements that matches the given
         * <var>selector</var>.
         *
         * @param {DOMString} selector - A css selector.
         * @return {Element} The child of each element matching the given selector.
         */
        'find': function (selector) {

            return JElement(this).get(
                function () { return JElement.find(selector, this); }
            );

        },
        /**
         * Find children of multiple Elements that match the given
         * <var>selector</var>.
         *
         * @param {DOMString} selector - A css selector.
         * @return {Element[]}
         */
        'findAll': function (selector) {

            return JElement(this).get(
                function () { return JElement.findAll(selector, this); }
            );

        },
        /**
         * Clone multiple Elements and copy their events and properties
         * attached via {@link just|Just}.
         *
         * @param {object} opts - Options
         * @param {boolean} [opts.deep=true] - Argument for <var>Node.cloneDeep</var>.
         * @return {Element[]}
         */
        'clone': function (opts) {

            var options = defaults(opts, {
                'deep': true
            });
            var deep = options.deep;

            return JElement(this).get(function () {

                return JElement(this.cloneNode(deep)).copy(this, {
                    'ignoreAttributes': true,
                    'ignoreText': true
                }).get();

            });

        },
        /**
         * Remove all given Elements.
         * @chainable
         */
        'remove': function () {

            return JElement(this).each(
                function () { this.parentNode.removeChild(this); }
            );

        },
        /**
         * Remove all children from multiple Elements.
         * @chainable
         */
        'removeChildren': function () {

            return JElement(this).each(function () {

                while (this.firstChild) { this.removeChild(this.firstChild); }

            });

        },
        /**
         * Check if multiple Elements are hidden somewhere.
         * @return {boolean[]}
         */
        'isHidden': function () {

            return JElement(this).get(function () {

                return this.parentNode === null
                    || this.getAttribute('hidden') !== null;

            });

        },
        /**
         * Replace each given Element with a new Element.
         * @param {Element} newElement
         * @return {Element[]} The new elements.
         */
        'replaceWith': function (newElement) {

            return JElement(this).get(function () {

                this.parentNode.replaceChild(newElement, this);

                return newElement;

            });

        },
        /**
         * Copy attributes, events, properties and text from <var>target</var>
         * to each given Element.
         * @param {Element} target
         * @param {object} opts - Options
         * @param {boolean} [opts.ignoreAttributes=false] - Don't copy attributes.
         * @param {boolean} [opts.ignoreEvents=false] - Don't copy events attached via {@link just.Event}.
         * @param {boolean} [opts.ignoreProperties=false] - Don't copy properties attached via {@link just.Element}.
         * @param {boolean} [opts.ignoreText=false] - Don't copy text.
         * @chainable
         */
        'copy': function (target, opts) {

            var options = defaults(opts, {
                'ignoreAttributes': false,
                'ignoreEvents': false,
                'ignoreProperties': false,
                'ignoreText': false
            });

            return JElement(this).each(function (jElement) {

                /* eslint-disable padded-blocks */
                if (!options.ignoreAttributes) {
                    jElement.cloneAttributes(target);
                }

                if (!options.ignoreEvents) {
                    jElement.cloneEvents(target);
                }

                if (!options.ignoreProperties) {
                    jElement.cloneProperties(target);
                }

                if (!options.ignoreText) {
                    jElement.textContent = target.textContent;
                }
                /* eslint-enable padded-blocks */

            });

        },
        /**
         * Replace multiple Elements with a new {@link just.Element#copy} of each one.
         *
         * @param {string} tagName - The new tag name.
         * @param {object} opts - Options
         * @param {object} opts.copy - Options for {@link just.Element#copy}.
         * @return {Element[]} The new elements.
         */
        'replaceTag': function (tagName, opts) {

            var options = defaults(opts, {
                'copy': {}
            });

            return JElement(this).get(function (jTarget) {

                var newElement = JElement(JElement.create(tagName))
                    .copy(this, options.copy)
                    .get();

                return jTarget.replaceWith(newElement).get();

            });

        },
        /**
         * {@link getRemoteParent|Get remote parent} of each given element.
         * @see {@link just.getRemoteParent}
         * @param {Element[]} Parent nodes.
         */
        'getRemoteParent': function (fn) {

            return JElement(this).get(
                function () { return getRemoteParent(this, fn); }
            );

        }

    });

    defineProperties(JElement.prototype, (function Properties () {

        var propertyName = 'just.Element.Properties';

        return /** @lends just.Element.prototype */{

            /**
             * {@link just.access|Access} to an scoped property within
             * each given Element.
             *
             * @param {string[]} path - Property keys.
             * @param {just.access~handler} fn - A handler for {@link just.access}.
             */
            'accessToProperty': function (path, fn) {

                return JElement(this).get(function () {

                    this[propertyName] = defaults(this[propertyName], {});
                    access(this[propertyName], path, fn);

                });

            },
            /**
             * Set a scoped property on each given element.
             *
             * @param {string[]} path - Property keys.
             * @param {*} value
             */
            'setProperty': function (path, value) {

                JElement(this).accessToProperty(this, path,
                    function (v, k) { v[k] = value; }
                );

                return this;

            },
            /**
             * Return the scoped property value of multiple Elements.
             *
             * @param {string[]} path - Property keys.
             * @return {Array}
             */
            'getProperty': function (path) {

                return JElement(this).accessToProperty(path,
                    function (v, k, exists) { return exists ? v[k] : void 0; }
                );

            },
            /**
             * Check on multiple Elements if an scoped property exists.
             * @param {string[]} path - Property keys.
             */
            'hasProperty': function (path) {

                return JElement(this).accessToProperty(path,
                    function (v, k, exists) { return exists; }
                );

            },
            /**
             * Remove a scoped property from multiple Elements.
             * @param {string[]} path - Property keys.
             * @chainable
             */
            'removeProperty': function (path) {

                JElement(this).accessToProperty(path,
                    function (v, k) { delete v[k]; }
                );

                return this;

            },
            /**
             * Return all scoped properties of each given Element.
             * @return {Array}
             */
            'getAllProperties': function () {

                return JElement(this).get(
                    function () { return this[propertyName]; }
                );

            },
            /**
             * Clone all scoped properties of each given Element.
             *
             * @param {Element} target - The Element to copy properties from.
             * @chainable
             */
            'cloneProperties': function (target) {

                var targetProperties = Object.assign({}, target[propertyName]);

                return JElement(this).each(function () {

                    Object.assign(this[propertyName], targetProperties);

                });

            }

        };

    })());

    return JElement;

})();

module.exports = JElement;
