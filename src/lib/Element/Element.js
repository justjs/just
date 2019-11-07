var Bounds = require('./Bounds');
var isWindow = require('../isWindow');
var defineProperties = require('../defineProperties');
var findElements = require('../findElements');
var defaults = require('../defaults');
var eachProperty = require('../eachProperty');
var check = require('../check');
var getRemoteParent = require('../getRemoteParent');
var access = require('../access');
var toObjectLiteral = require('../toObjectLiteral');
var JElement = (function () {

    'use strict';

    var get = function (fn, opts) {

        var options = defaults(opts, {
            'thisAsArg': 0,
            'wrap': true
        });
        var addJElementWrapper = options.wrap;
        var thisArgIndex = options.thisAsArg;
        var useThisAsArg = thisArgIndex > -1;

        return function () {

            var methodArgs = arguments;
            var results = JElement(this).get(function () {

                var args = [].slice.call(methodArgs);

                if (useThisAsArg) { args.splice(thisArgIndex, 0, this); }

                return fn.apply(this, args);

            });

            return (addJElementWrapper
                ? new JElement(results)
                : results
            );

        };

    };
    var chain = function (fn, opts) {

        var options = Object.assign({}, opts, {
            'wrap': false
        });

        return function () {

            var args = [].slice.call(arguments);

            get(fn, options).apply(this, args);

            return this;

        };

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
        /* eslint-enable padded-blocks */

        defineProperties(this, {
            /** @member {number} */
            'length': [].push.apply(this, elements)
        });

    }

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
         * Create an Element using a {@link just.Element.namespaces|known namespace} (if possible).
         *
         * @param {string} tagName
         * @param {string|url} [namespace] A namespace URI.
         */
        'create': function createElement (tagName, namespace) {

            var tag = tagName = tagName.toLowerCase().trim();
            var namespaceURI = JElement.namespaces[namespace] || JElement.namespaces[tag] || namespace;

            return (namespaceURI
                ? document.createElementNS(namespaceURI, tagName)
                : document.createElement(tagName)
            );

        },
        /**
         * Build elements from a string.
         *
         * @param {!string} elementAsString - A css-selector like string.
         *     I.e., any combination of:
         *     - "tagName", "namespace:tagName", "tagName>tagName", ...
         *     - "tagName[attribute]", "tagName[attribute=some value]", "tagName[attribute=\"value\"]", ...
         *     - "tagName.class", ...
         *     - "tagName#id", ...
         *     - "tagName>>text", ...
         *
         * @example <caption>Build an Element.</caption>
         * build('div'); // A &lt;div&gt;.
         * build('something'); // A &lt;something&gt;.
         *
         * @example <caption>Build an Element within a namespace.</caption>
         * build('svg'); // Element.namespaces['svg'] is implied.
         * build('http://www.w3.org/1999/xhtml:div'); // http://www.w3.org/1999/xhtml
         *
         * @example <caption>Build a Text Node.</caption>
         * build('>text'); // Text Node with "text" as text.
         *
         * @example <caption>Build a nested Element.</caption>
         * build('div>span'); // &lt;span&gt; within a &lt;div&gt;.
         * build('div>div>span'); // &lt;span&gt; within a &lt;div&gt; within a &lt;div&gt;.
         *
         * @example <caption>Build nested Text Node. --Note the double ">".</caption>
         * build('span>>text'); // Builds a &lt;span&gt; with "text" as text. Returns the Text Node.
         * build('div>>span>b'); // Builds a &lt;div&gt; with "span>b" as text. Returns the Text Node.
         *
         * @example <caption>Build an Element with an id.</caption>
         * build('div#id'); // &lt;div&gt; with "id" as id.
         * build('div#id#id2'); // &lt;div&gt; with "id2" as id. (The latest takes precedence).
         *
         * @example <caption>Build an Element with a class.</caption>
         * build('div.class'); // &lt;div&gt; with "class" as class name.
         * build('div.class.class2'); // &lt;div&gt; with "class" and "class2" as classes.
         *
         * @example <caption>Build an Element with an attribute.</caption>
         * build('div[hidden]'); // &lt;div&gt; with "hidden" as attribute.
         * build('div[title="x"]'); // &lt;div&gt; with "title" (equal to "x") as attribute.
         * build('div[title='single quotes']'); // &lt;div&gt; with "title" (equal to "single quotes") as attribute.
         * build('div[title=without quotes]'); // &lt;div&gt; with "title" (equal to "without quotes") as attribute.
         * build('div[title="x"][title="y"]'); // &lt;div&gt; with "title" (equal to "y") as attribute. (The latest takes precedence).
         * build('a[xlink:href="url"]'); // &lt;a&gt; with "href" (of the "xlink" namespace, equal to "url") as attribute.
         *
         * @example <caption>Build nested Elements with custom specifications.</caption>
         * build('div.parent#div.wrapper[data-tag="div"]>span#span[data-tag="span"]>>Some text.');
         *
         * @return {Node} The latest built Element.
         */
        'build': function buildElement (elementAsString) {

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

                element = JElement.create(tagName, tagNamespace);

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

                        JElement.setAttributes(element, attributes);

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
        'find': function findOneElement (selector, parent) {

            return findElements(selector, parent)[0];

        },
        /**
         * @borrows just.getRemoteParent as getRemoteParent
         */
        'getRemoteParent': getRemoteParent,
        /**
         * Return the size and position of <var>Element</var>.
         *
         * @param {Element} element
         * @returns {just.Element.Bounds}
         */
        'getBounds': function getElementBounds (element) {

            var bounds;

            /* eslint-disable padded-blocks */
            if (isWindow(element)) {
                return JElement.getWindowBounds();
            }

            if (/^html$/i.test(element.tagName)) {
                return JElement.getDocumentBounds();
            }
            /* eslint-enable padded-blocks */

            try { bounds = element.getBoundingClientRect(); }
            catch (exception) { /* unspecified error IE11 (?) */ }

            return new Bounds(bounds, {
                'width': bounds.width || (bounds.right - bounds.left),
                'height': bounds.height || (bounds.bottom - bounds.top)
            });

        },
        /**
         * Return the size and position of <var>window</var>.
         * @return {just.Element.Bounds}
         */
        'getWindowBounds': function getWindowBounds () {

            var html = document.documentElement;
            var position = {
                'x': window.scrollX || window.pageXOffset || html.scrollLeft,
                'y': window.scrollY || window.pageYOffset || html.scrollTop
            };
            var size = {
                'width': window.innerWidth || html.clientWidth,
                'height': window.innerHeight || html.clientHeight
            };

            return new Bounds(position, size);

        },
        /**
         * Return the size and position of <var>document</var>.
         * @return {just.Element.Bounds}
         */
        'getDocumentBounds': function getDocumentBounds () {

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

            return new Bounds(position, size);

        },
        /**
         * Check if the given <var>bounds</var> are within <var>element</var>.
         *
         * @param {Element} element
         * @param {just.Element.Bounds} bounds - The target position.
         * @return {boolean[]}
         */
        'isInsideBounds': function isInsideElementBounds (element, bounds) {

            var elementBounds = JElement.getBounds(element);

            return (
                elementBounds.bottom > 0
                && elementBounds.right > 0
                && elementBounds.left < bounds.width
                && elementBounds.top < bounds.height
            );

        },
        /**
         * Resize <var>element</var> to fit inside <var>sizeBounds</var>.
         *
         * @param {Element} element
         * @param {just.Element.Bounds~size} sizeBounds - The maximum size.
         * @param {number} [sizeBounds.width=0]
         * @param {number} [sizeBounds.height=0]
         */
        'fitInBounds': function fitInElementBounds (element, sizeBounds) {

            var maxSize = defaults(sizeBounds, {
                'width': 0,
                'height': 0
            });
            var ratio = Math.min(maxSize.width / this.width, maxSize.height / this.height);

            this.width *= ratio;
            this.height *= ratio;

        },
        /**
         * Check if <var>element</var> is inside the visible area.
         *
         * @param {Element} element
         * @return {boolean}
         */
        'isOnScreen': function isElementOnScreen (element) {

            return JElement.isVisible(element)
                && JElement.isInsideBounds(element, JElement.getWindowBounds());

        },
        /**
         * Check if <var>element</var> is visible somewhere.
         *
         * @param {Element} element
         * @return {boolean}
         */
        'isVisible': function isElementVisible (element) {

            var bounds = JElement.getBounds(element);

            return !JElement.isHidden(element) && !!(bounds.width || bounds.height);

        },
        /**
         * Check if <var>element</var> is hidden somewhere.
         *
         * @param {Element} element
         * @return {boolean}
         */
        'isHidden': function isElementHidden (element) {

            return element.parentNode === null || element.getAttribute('hidden') !== null;

        },
        /**
         * Remove <var>element</var> from the DOM.
         *
         * @return {Element} The old child.
         */
        'remove': function removeElement (element) {

            return element.parentNode.removeChild(element);

        },
        /**
         * Remove all children from <var>parent</var>.
         *
         * @param {Element} parent
         * @return {undefined}
         */
        'removeChildren': function removeElementChildren (parent) {

            while (parent.firstChild) { JElement.remove(parent.firstChild); }

        },
        /**
         * Replace <var>target</var> with <var>newElement</var>.
         *
         * @param {Element} target
         * @param {Element} newElement
         * @return {Element} <var>newElement</var>.
         */
        'replace': function replaceElement (target, newElement) {

            target.parentNode.replaceChild(newElement, target);

            return newElement;

        },
        /**
         * Replace <var>element</var> with a new {@link just.Element#copy} of it.
         *
         * @param {Element} element
         * @param {string} tagName - The new tag name.
         * @param {object} opts - Options
         * @param {object} opts.copy - Options for {@link just.Element#copy}.
         * @return {Element} The new element.
         */
        'replaceTag': function replaceElementTag (element, tagName, opts) {

            var options = defaults(opts, {
                'copy': {}
            });
            var newElement = JElement.build(tagName);
            var elementCopy = JElement.copy(element, newElement, options.copy);

            return JElement.replace(elementCopy, newElement);

        },
        /**
         * Copy attributes, events, properties and text from <var>target</var>
         * to <var>element</var>.
         *
         * @param {Element} element
         * @param {Element} target
         * @param {object} opts - Options
         * @param {boolean} [opts.ignoreAttributes=false] - Don't copy attributes.
         * @param {boolean} [opts.ignoreEvents=false] - Don't copy events attached via {@link just.Event}.
         * @param {boolean} [opts.ignoreProperties=false] - Don't copy properties attached via {@link just.Element}.
         * @param {boolean} [opts.ignoreText=false] - Don't copy text.
         *
         * @return {undefined}
         */
        'copy': function copyElement (element, target, opts) {

            var options = defaults(opts, {
                'ignoreAttributes': false,
                'ignoreEvents': false,
                'ignoreProperties': false,
                'ignoreText': false
            });

            /* eslint-disable padded-blocks */
            if (!options.ignoreAttributes) {
                JElement.cloneAttributes(element, target);
            }

            if (!options.ignoreEvents) {
                JElement.cloneEvents(element, target);
            }

            if (!options.ignoreProperties) {
                JElement.cloneScopedProperties(element, target);
            }

            if (!options.ignoreText) {
                element.textContent = target.textContent;
            }
            /* eslint-enable padded-blocks */

        },
        /**
         * Clone <var>element</var> and copy their events and properties
         * attached via {@link just|Just}.
         *
         * @param {object} opts - Options
         * @param {boolean} [opts.deep=true] - Argument for <var>Node.cloneDeep</var>.
         * @return {Element} The clon.
         */
        'clone': function cloneElement (element, opts) {

            var options = defaults(opts, {
                'deep': true
            });
            var deep = options.deep;
            var elementClon = element.cloneNode(deep);

            return JElement.copy(element, elementClon, {
                'ignoreAttributes': true,
                'ignoreText': true
            });

        },
        /**
         * Return all the attributes of <var>element</var>.
         *
         * @param {Element} element
         * @return {object} The attributes.
         */
        'getAttributes': function getAllElementAttributes (element) {

            var attributes = {};

            eachProperty(element.attributes, function (attribute) {

                var key = attribute.name || attribute.nodeName;
                var value = attribute.value || attribute.nodeValue;

                attributes[key] = value;

            });

            return attributes;

        },
        /**
         * Set normal and namespaced attributes to <var>element</var>.
         *
         * @throw {TypeError} If <var>attributes</var> is not an object.
         * @param {Element} element
         * @param {object} attributes
         * @return {undefined}
         */
        'setAttributes': function setElementAttributes (element, attributes) {

            eachProperty(check.throwable(attributes, {}), function (value, name) {

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

            }, element);

        },
        /**
         * Replace normal and namespaced attributes of <var>element</var>.
         *
         * @throw {TypeError} If <var>attributes</var> is not an object.
         * @param {Element} element
         * @param {object} attributes
         * @param {boolean} [allowEmptyValues=false]
         * @return {undefined}
         */
        'replaceAttributes': function replaceElementAttributes (element, attributes, allowEmptyValues) {

            eachProperty(check.throwable(attributes, {}), function (newName, name) {

                var value = this.getAttribute(name) || '';

                if (!value && !allowEmptyValues) { return; }

                JElement.removeAttributes(this, name);
                JElement.setAttributes(this, toObjectLiteral([newName, value]));

            }, element);

        },
        /**
         * Remove multiple attributes of <var>element</var>.
         *
         * @param {Element} element
         * @param {string[]} attributes - The name of the attributes.
         * @return {undefined}
         */
        'removeAttributes': function removeElementAttributes (element, attributes) {

            defaults(attributes, [attributes]).forEach(
                function (name) { this.removeAttribute(name); },
                element
            );

        },
        /**
         * Clone all attributes from <var>target</var> and set them
         * to <var>element</var>.
         *
         * @param {Element} element
         * @param {Element} target
         * @return {undefined}
         */
        'cloneAttributes': function cloneElementAttributes (element, target) {

            JElement.setAttributes(this, JElement.getAttributes(target));

        },
        /**
         * {@link just.access|Access} to an scoped property within
         * each given Element.
         *
         * @method
         * @param {Element} element
         * @param {string[]} path - Property keys. Use an empty array to access to everything.
         * @param {just.access~handler} fn - A handler for {@link just.access}.
         * @return {undefined}
         */
        'accessToScopedProperty': function accessToScopedElementProperty (element, path, fn) {

            var scope = 'just.Element.Property';

            access(element, [scope].concat(path), fn);

        },
        /**
         * Set a scoped property on each given element.
         *
         * @method
         * @param {Element} element
         * @param {string[]} path - Property keys.
         * @param {*} value
         * @return {undefined}
         */
        'setScopedProperty': function setScopedElementProperty (element, path, value) {

            JElement.accessToScopedProperty(this, path,
                function (v, k) { v[k] = value; }
            );

        },
        /**
         * Return the scoped property value of multiple Elements.
         *
         * @method
         * @param {Element} element
         * @param {string[]} path - Property keys.
         * @return {Array|undefined} The value of the property or `undefined`.
         */
        'getScopedProperty': function getScopedElementProperty (element, path) {

            return JElement.accessToScopedProperty(element, path,
                function (v, k, exists) { return exists ? v[k] : void 0; }
            );

        },
        /**
         * Check on multiple Elements if an scoped property exists.
         *
         * @method
         * @param {Element} element
         * @param {string[]} path - Property keys.
         * @return {boolean}
         */
        'hasScopedProperty': function containsScopedElementProperty (element, path) {

            return JElement.accessToScopedProperty(element, path,
                function (v, k, exists) { return exists; }
            );

        },
        /**
         * Remove a scoped property from multiple Elements.
         *
         * @method
         * @param {Element} element
         * @param {string[]} path - Property keys.
         * @return {undefined}
         */
        'removeScopedProperty': function removeScopedElementProperty (element, path) {

            JElement.accessToScopedProperty(element, path,
                function (v, k) { delete v[k]; }
            );

        },
        /**
         * Return all scoped properties of each given Element.
         *
         * @method
         * @param {Element} element
         * @return {Array}
         */
        'getAllScopedProperties': function getAllScopedProperties (element) {

            return JElement.getScopedProperty(element, []);

        },
        /**
         * Clone all scoped properties of each given Element.
         *
         * @method
         * @param {Element} element
         * @param {Element} target - The Element to copy properties from.
         * @return {undefined}
         */
        'cloneScopedProperties': function cloneScopedElementProperties (element, target) {

            JElement.setProperty(element, [], JElement.getAllProperties(target));

        }

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
         * @see Same as {@link just.Element#get} but chainable.
         * @method
         * @chainable
         */
        'each': chain(JElement.prototype.get, {'thisAsArg': -1}),
        /**
         * Find one child for each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.find}
         */
        'find': get(JElement.find, {'thisAsArg': 1}),
        /**
         * Find all children for each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.findAll}
         */
        'findAll': get(JElement.findAll, {'thisAsArg': 1}),
        /**
         * Remove each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.remove}
         */
        'remove': get(JElement.remove),
        /**
         * Remove all children for each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.removeChildren}
         */
        'removeChildren': chain(JElement.removeChildren),
        /**
         * Replace each element of <var>this</var> with new elements. <p>Chainable.</p>
         * @type {just.Element.replace}
         */
        'replaceWith': get(JElement.replace),
        /**
         * Copy each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.copy}
         */
        'copy': chain(JElement.copy),
        /**
         * Clone each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.clone}
         */
        'clone': get(JElement.clone),
        /**
         * Set attributes of each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.setAttributes}
         */
        'setAttributes': chain(JElement.setAttributes),
        /**
         * Replace attributes of each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.replaceAttributes}
         */
        'replaceAttributes': chain(JElement.replaceAttributes),
        /**
         * Remove attributes of each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.removeAttributes}
         */
        'removeAttributes': chain(JElement.removeAttributes),
        /**
         * Clone all attributes for each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.cloneAttributes}
         */
        'cloneAttributes': chain(JElement.cloneAttributes),
        /**
         * Access to scoped property for each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.accessToScopedProperty}
         */
        'accessToProperty': chain(JElement.accessToScopedProperty),
        /**
         * Set an scoped property for each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.setScopedProperty}
         */
        'setProperty': chain(JElement.setScopedProperty),
        /**
         * Remove an scoped property for each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.removeScopedProperty}
         */
        'removeProperty': chain(JElement.removeScopedProperty),
        /**
         * Clone scoped properties for each element of <var>this</var>. <p>Chainable.</p>
         * @type {just.Element.cloneScopedProperties}
         */
        'cloneProperties': chain(JElement.cloneScopedProperties)

    });

    return JElement;

})();

module.exports = JElement;
