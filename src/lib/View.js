var parseJSON = require('./parseJSON');
var defaults = require('./defaults');
var defineProperties = require('./defineProperties');
var eachProperty = require('./eachProperty');
var stringToJSON = require('./stringToJSON');
var findElements = require('./findElements');
var View = (function () {

    function isReservedKeyword (string) {

        var trimmedString = string.trim();

        return /^(?:undefined|false|true|null)$/.test(trimmedString);

    }

    function isVar (string) {

        var trimmedString = string.trim();

        return /^[a-z]/.test(trimmedString)
            && !isReservedKeyword(trimmedString);

    }

    function matchNested (string, openSymbol, closeSymbol, transform) {

        if (typeof transform !== 'function') {

            transform = function (matched) { return matched; };

        }

        return string.split(closeSymbol).reduce(function (left, right) {

            var matched = left + right;
            var openSymbolIndex = matched.lastIndexOf(openSymbol);
            var hasOpenSymbol = openSymbolIndex > -1;
            var enclosed = null;
            var result = matched;

            if (hasOpenSymbol) {

                enclosed = matched.slice(openSymbolIndex + 1);
                result = matched.slice(0, openSymbolIndex);

            }

            return transform(result, {
                'enclosed': enclosed,
                'index': openSymbolIndex
            });

        }, '');

    }

    /**
     * Parse argument-like strings ("a, b, c") and return valid JSON values.
     *
     * It supports dot notation on each argument. It doesn't support functions
     * as arguments or variables in objects (Eg. `fn({"a": var}, [var])`).
     *
     * It uses JSON.parse internally.
     *
     * @example
     * parseArguments("a, b, c", {})
     *
     */
    function parseArguments (string, data) {

        var invalidJSONValues = {};
        var unparsedArgs = (',' + string + ',')
            // Match numbers, variables and reserved keywords.
            .replace(/,\s*([\w.-]+)\s*(?=,)/ig, function ($0, value, index) {

                var arg = (/^\d/.test(value)
                    ? parseFloat(value)
                    : access(value, data)
                );
                var requiresQuotes = typeof arg === 'object' && arg !== null || typeof arg === 'string';

                return ',' + (requiresQuotes
                    ? JSON.stringify(arg)
                    : arg
                );

            })
            // Remove extra commas.
            .replace(/^,|,$/g, '')
            // Replace invalid JSON values with a random/unique string.
            .replace(/(\b)undefined(\b)/g, function ($0, $1, $2) {

                var uniqueString = Math.random() + '';

                invalidJSONValues[uniqueString] = void 0;

                return $1 + JSON.stringify(uniqueString) + $2;

            });
        // Parse as an array.
        var parseableArgs = '[' + unparsedArgs + ']';
        // Parse args as JSON and replace invalid values back.
        var args = parseJSON(parseableArgs).map(function (arg, i) {

            return (arg in invalidJSONValues
                ? invalidJSONValues[arg]
                : arg
            );

        });

        return args;

    }

    /**
     * Access to properties using the dot notation.
     *
     * Supports nested function arguments replacements and
     * reserved keywords. See {@link just.View~parseArguments}.
     *
     * @example
     * access('a.b(c(d))', {
     *   'a': {'b': function (v) { return v + 'b'; }},
     *   'c': function (v) { return v + 'c'; },
     *   'd': 'd'
     * }); // > 'dcb';
     */
    function access (keys, data) {

        var allArgsSorted = [];

        if (!keys) { return; }

        /**
         * The way it works is by JSON.parsing things within parenthesis,
         * store each result in an array (`allArgsSorted`),
         * and removing parenthesis from the final string (`keysNoArgs`).
         *
         * Then, once we removed all parenthesis, we access
         * each property in the final string (using the dot notation)
         * and start replacing values. And since arguments were
         * removed from the final string, we just have to worry
         * for checking if the accessed property is a function and
         * evaluate them with the stored arguments in order.
         */
        return matchNested(keys, '(', ')', function (matched, detail) {

            var enclosed = detail.enclosed;
            var args;

            if (enclosed !== null) {

                args = parseArguments(enclosed, data);

                // Store apart.
                allArgsSorted.push(args);

                return matched;

            }

            // Replace values using the dot notation.
            return matched.split('.').reduce(function (context, keyNoArgs) {

                var contextObj = Object(context);
                var key = keyNoArgs.trim();
                var value = (isVar(key)
                    ? contextObj[key]
                    : key in String.prototype
                    ? String.prototype[key]
                    // Replace reserved keywords, numbers, objects, ...
                    : typeof key !== 'undefined' && key !== 'undefined'
                    ? parseJSON(key)
                    : void 0
                );
                var result = value;
                var fn, args;

                /**
                 * Since parenthesis where removed, replacing
                 * arguments is as simple as evaluating this
                 * value with the arguments stored previously.
                 */
                if (typeof value === 'function') {

                    fn = value;
                    args = allArgsSorted.pop();
                    result = fn.apply(contextObj, args);

                }

                return result;

            }, data);

        });

    }

    /**
     * Templarize elements easily.
     *
     * @class
     * @memberof just
     *
     * @param {?object} options
     * @param {?string} options.id
     * @param {?Element} options.element
     * @param {?object} options.data
     * @param {?string|?object} options.attributes
     */
    function View (options) {

        var props = defaults(options, {
            'id': null,
            'element': null,
            'data': {},
            'attributes': null
        }, {'ignoreNull': true});
        var attributes = props.attributes;
        var attributesPrefix = (typeof attributes === 'string'
            ? attributes
            : 'data-var'
        );
        var attributesObj = Object.assign({
            'var': attributesPrefix,
            'html': attributesPrefix + '-html',
            'attr': attributesPrefix + '-attr',
            'if': attributesPrefix + '-if',
            'alias': attributesPrefix + '-as',
            'for': attributesPrefix + '-for'
        }, (typeof attributes === 'object'
            ? attributes
            : {}
        ));

        Object.assign(this, props, {
            'attributes': attributesObj,
            'previousData': null
        });

        this.original = Object.assign({}, this);

    }

    defineProperties(View, {
        'globals': {},
        /**
         * Access to an object and return its value-
         *
         * @param {?string} condititional - Expected keys splitted by ".".
         *        Use "!" to negate a expression.
         *        Use "true" to return true.
         * @parma {?object} data - An object with all the properties.
         *
         * @returns {*|boolean} if the conditional is negated, a boolean.
         * Else, the accessed value.
         */
        'resolveConditional': function resolveConditional (conditional, data) {

            var negate = /^!/.test(conditional);
            var nonNegatedConditional = (conditional + '').replace('!', '');
            var properties = nonNegatedConditional;
            var value = (/^true$/.test(nonNegatedConditional)
                ? true
                : access(properties, data)
            );

            if (negate) { value = !value; }

            return value;

        },
        /**
         * Access to multiple conditionals and return the first value
         * that is truthy.
         *
         * @param {?object|?string} conditionals - An object containing conditions
         *        (expected properties) as keys, or a string containing a condition
         *        (a expected property).
         * @param {?object} data - An object with all the properties.
         * @returns {*} View.resolveConditional()'s returned value.'
         */
        'resolveConditionals': function resolveConditionals (conditionals, data) {

            var conditionalsObj = Object(conditionals);
            var conditional;
            var resolvedValue;

            if (typeof conditionals === 'string') {

                conditional = conditionals;
                conditionalsObj = {};
                conditionalsObj[conditional] = View.resolveConditional(conditional, data);

            }

            eachProperty(conditionalsObj, function (value, conditional) {

                var isTruthy = View.resolveConditional(conditional, data);

                // Return at first match.
                if (isTruthy) { return (resolvedValue = value); }

            });

            return resolvedValue;

        },
        /**
         * Replace placeholders (${}, eg. "${deep.deeper}") within a string.
         *
         * It supports:
         * - Functions (1): ${deep.deeper(1, "", myVar, ...)
         * - String#methods: ${do.trim().replace('', '')}).
         * - Deep replacements: ${a.b.c} or ${a.b().c()}
         *
         * (1) We don't currently support functions nor ES6+ things as arguments
         * (like Symbols or all that stuff).
         *
         * @param {?string|?object} value - Some text or an object.
         *        If an object is given, it will {@link just.View.resolveConditionals} first,
         *        then replace ${placeholders} within the accessed value.
         * @param {?object} data - An object containing the data to be replaced.
         * @example <caption>Using a string</caption>
         * View.replaceVars('${splitted.property}!', {
         *     'splitted': {'property': 'key'}
         * }); // > "hey!"
         *
         * @example <caption>Using an object</caption>
         * View.replaceVars({
         *     'a': 'Show ${a}',
         *     'b': 'Show ${b}'
         * }, {'b': 'me (b)'}); // > "Show me (b)"
         *
         * @example <caption>Inexistent property</caption>
         * View.replaceVars('Don't replace ${me}!') // "Don't replace ${me}!"
         *
         * @returns {string} The replaced string.
         *          If some value is undefined, it won't be replaced at all.
         */
        'replaceVars': function replaceVars (value, data) {

            var text = String(typeof value === 'object'
                ? View.resolveConditionals(value, data)
                : value
            );

            return text.replace(/(\$\{[^(]+\()([^)]+)(\)\})/g, function encodeFnArgs (
                $0, $1, $2, $3) {

                return $1 + encodeURI($2) + $3;

            }).replace(/\$\{([^}]+)\}/g, function replacePlaceholders ($0, $1) {

                var key = decodeURI($1);
                var value = access(key, data);
                var placeholder = decodeURI($0);

                return (typeof value !== 'undefined'
                    ? value
                    : placeholder
                );

            });

        },
        /**
         * A function to set the updated value.
         *
         * @param {Element} element - The target element.
         * @param {string} text - The updated text.
         * @return {boolean} true if updated, false otherwise.
         * @typedef {function} just.View~updateVars_setter
         */

        /**
         * Update the element's text if the attribute's value
         * is different from the accessed value.
         *
         * @param {Element} element - The target element.
         * @param {?object} data - Some object.
         * @param {?string} attributeName - The name for the queried attribute.
         * @param {?just.View~updateVars_setter} [setter=element.textContent] - If set,
         *        a function to update the element's text. Expects a boolean to be returned.
         *        Else, element.textContent will be used to set the updated value and return true.
         *
         * @return {boolean} true if the value was updated, false otherwise.
         *         Any other value will be casted to a Boolean.
         */
        'updateVars': function updateVars (element, data, attributeName, setter) {

            var set = defaults(setter, function (element, text) {

                element.textContent = text;

                return true;

            });
            var attribute = element.getAttribute(attributeName);
            var text;

            if (!attribute) { return false; }

            text = View.replaceVars(attribute, data);

            return Boolean(text !== attribute
                ? set(element, text)
                : false
            );

        },
        /**
         * Update the element's markup using {@link just.View.updateVars}
         * and element.innerHTML.
         *
         * @param {Element} element - The target element.
         * @param {?object} data - Some object.
         * @param {?string} attributeName - The name for the queried attribute.
         *
         * @return {boolean} true if the value was updated, false otherwise.
         */
        'updateHtmlVars': function updateHtmlVars (element, data, attributeName) {

            return View.updateVars(element, data, attributeName, function (element, html) {

                element.innerHTML = html;

                return true;

            });

        },
        /**
         * Show/Hide an element (by setting/removing the [hidden] attribute)
         * after {@link just.View.resolveConditionals|evaluating the conditional}
         * found in the given <var>attribute</var>.
         *
         * @param {Element} element - The target element.
         * @param {?object} data - Some object.
         * @param {string} attributeName - The name for the queried attribute.
         *
         * @return {boolean} True if resolved (and hidden), false otherwise.
         */
        'updateConditionals': function updateConditionals (element, data, attributeName) {

            var attribute = element.getAttribute(attributeName);
            var parentNode = element.parentNode;
            var value;

            if (!parentNode || !attribute) { return false; }

            value = View.resolveConditionals(attribute, data);

            if (!value) { element.setAttribute('hidden', ''); }
            else { element.removeAttribute('hidden'); }

            return Boolean(value);

        },
        /**
         * Create dynamic attributes after {@link just.View.replaceVars|replacing variables}
         * in values.
         *
         * Please note that null/undefined values won't be replaced.
         *
         * @param {Element} element - The target element.
         * @param {?object} data - Some object.
         * @param {?string} attributeName - The name for attribute containing a stringified json.
         *
         * @return {boolean} true if the attribute contains some value, false otherwise.
         */
        'updateAttributes': function updateAttributes (element, data, attributeName) {

            var attribute = element.getAttribute(attributeName);
            var attributes;

            if (!attribute) { return false; }

            attributes = stringToJSON(attribute);

            eachProperty(attributes, function (attribute, key) {

                var value = View.replaceVars(attribute, data);

                // Don't save null or undefined values on attributes.
                if (/^(?:null|undefined)$/.test(value)) { return; }

                this.setAttribute(key, value);

            }, element);

            return true;

        },
        /**
         * Define aliases using a stringified JSON from an element attribute;
         * access object values and set keys as alias.
         *
         * @param {Element} element - The target element.
         * @param {?object} data - Some object.
         * @param {?string} attributeName - The name for attribute containing a stringified json.
         *
         * @return {!object} An object containing keys as alias.
         */
        'getAliases': function getAliases (element, data, attributeName) {

            var attribute = element.getAttribute(attributeName);
            var aliases = {};
            var json;

            if (attribute) {

                json = stringToJSON(attribute);

                eachProperty(json, function (value, key) {

                    this[key] = access(value, data);

                }, aliases);

            }

            return aliases;

        },
        /**
         * Expression in the format:
         * "<currentItem> in <accessed.array>[ as <updatableAttribute>]".
         *
         * Where text enclosed in brackets is optional, and:
         * `<currentItem>` is the property containing the current iteration data.
         * `<accessed.array>` is a property to be {@link just.View.access|accessed} that contains an array as value.
         * `<updatableAttribute>` is the name of the attribute that will be updated afterwards by {@link View#update}.
         *
         * @example
         * "item in some.items"
         * // Will iterate over `some.items`, set `item` to each element (some.items[0], some.items[1], and so on...), and make `item` available under the default attribute.
         *
         * @example
         * "item in some.items as data-item"
         * // Will iterate over `some.items`, set `item` to each element, and make `item` available under the [data-item] attribute only.
         *
         * @typedef {string} just.View.updateLoops_expression
         */

        /**
         * Iterate over an array to create multiple elements
         * based on a given template (`element`),
         * append them in order, and update each generated element.
         *
         * New elements will contain the template's id as a class,
         * the "template" class will be removed, and the "hidden" attribute
         * will be removed too.
         *
         * @param {Node} element - The target element.
         * @param {Object} data - The data.
         * @param {string} attributeName - The attribute containing the {@link just.View.updateLoops_expression|loop expression}.
         *
         * @returns {?View[]} The updated views or null.
         */
        'updateLoops': function updateLoops (element, data, attributeName) {

            var attribute = element.getAttribute(attributeName);
            var objectProperty, varName, newAttributeName, object;

            // var in data.property as attribute
            if (/(\S+)\s+in\s+(\S+)(?:\s+as\s+(\S+))?/i.test(attribute)) {

                varName = RegExp.$1;
                objectProperty = RegExp.$2;
                /*
                 * Use "data-x" attribute in 'data-var-for="value in values as data-x"'
                 * or "data-var-for-value" in 'data-var-for="value in values"'.
                 */
                newAttributeName = RegExp.$3 || attributeName + '-' + varName;
                object = access(objectProperty, data) || [];

                if (Array.isArray(object)) {

                    // Loop each element of data.property
                    return (function (array) {

                        var parent = element.parentNode;
                        var arrayLength = array.length;
                        var children = [].slice.call(parent.children);
                        var viewData = Object.assign({}, data);
                        var cachedViews = children.reduce(function (views, child) {

                            var cachedView = child.view;

                            if (cachedView && cachedView.element !== element) { views.push(cachedView); }

                            return views;

                        }, []);
                        var cachedView, view, child;

                        // Create necessary elements to match array.length.
                        while (cachedViews.length < arrayLength) {

                            view = new View({
                                'element': element,
                                'attributes': newAttributeName
                            }).create().append(parent);

                            // Cache.
                            view.element.view = view;
                            cachedViews.push(view);

                        }

                        // Remove extra elements to match array.length.
                        while (cachedViews.length > arrayLength) {

                            cachedView = cachedViews.pop();
                            child = cachedView.element;

                            try { child.parentNode.removeChild(child); }
                            catch (e) { console.error(e); }

                        }

                        // Once cachedViews.length and array.length are the same, update views as usual.
                        return cachedViews.map(function (cachedView, i) {

                            viewData[varName] = array[i];

                            // @TODO Add current loop values to viewData.

                            return cachedView.update(viewData);

                        });

                    })(object);

                }

            }

            return null;

        }

    });

    defineProperties(View.prototype, {

        'getUpdatables': function queryAllUpdatables (container) {

            var attributes = this.attributes;
            var attributeForVars = attributes.var;
            var attributeForHtml = attributes.html;
            var attributeForIf = attributes.if;
            var attributeForAttributes = attributes.attr;
            var attributeForLoops = attributes.for;

            return findElements([
                '[' + attributeForVars + ']',
                '[' + attributeForHtml + ']',
                '[' + attributeForIf + ']',
                '[' + attributeForAttributes + ']',
                '[' + attributeForLoops + ']'
            ].join(','), container);

        },
        'create': function createTemplate () {

            var id = this.id;
            var template = this.element || document.getElementById(id);
            var templateClon;
            var templateClonID;

            if (!(template instanceof Node)) { throw new TypeError('You must provide a valid Node using #id or #template.'); }

            templateClon = template.cloneNode(true);
            templateClonID = templateClon.id;
            templateClon.classList.remove('template');
            if (templateClonID) { templateClon.classList.add(templateClonID); }

            templateClon.removeAttribute('hidden');
            templateClon.removeAttribute('id');

            this.element = templateClon;

            return this;

        },
        'update': function updateTemplate (data, skip) {

            var element = this.element;
            var localData = this.data;
            var globals = View.globals;
            var dataWithAliases = Object.assign({}, globals, localData, data);
            var attributes = this.attributes;
            var attributeForAliases = attributes.alias;
            var attributeForIf = attributes.if;
            var attributeForAttributes = attributes.attr;
            var attributeForHtml = attributes.html;
            var attributeForVars = attributes.var;
            var attributeForLoops = attributes.for;
            var updatableElements;
            var elementsWithAliases;

            if (!element) { return this; }

            this.previousData = data;
            elementsWithAliases = findElements(
                '[' + attributeForAliases + ']',
                element
            ).concat(element);

            elementsWithAliases.forEach(function (element) {

                Object.assign(dataWithAliases, View.getAliases(
                    element,
                    dataWithAliases,
                    attributeForAliases
                ));

            });

            updatableElements = this
                .getUpdatables(element)
                .concat(element);

            updatableElements.forEach(function (element) {

                if (typeof skip === 'function' && skip(element)) { return; }

                View.updateConditionals(element, dataWithAliases, attributeForIf);
                View.updateAttributes(element, dataWithAliases, attributeForAttributes);
                View.updateHtmlVars(element, dataWithAliases, attributeForHtml);
                View.updateVars(element, dataWithAliases, attributeForVars);
                View.updateLoops(element, dataWithAliases, attributeForLoops);

            });

            return this;

        },
        'refresh': function (newData, skip) {

            var previousData = this.previousData;
            var data = Object.assign({}, previousData, newData);

            this.update(data, skip);

            return this;

        },
        /**
         * Insert just.View#element at the given <var>position</var>
         * into the given <var>container</var>.
         *
         *
         * @param {string|object<{before: Node}>} position
         *        - "after" will append the element. This will be deprecated.
         *        - "before" will insert the element before the first child.
         *        - {"before": Node} will insert the element before the given Node.
         * @param {?Node} container - The Node that will contain the element.
         *
         * @throws {TypeError} if a container can't be guessed.
         * @throws {TypeError} if the <var>position</var> is invalid.
         *
         * @TODO Don't use "after" to append. Replace it with "append" or something else.
         * @chainable
         */
        'insert': function insert (position, container) {

            var template = this.element;
            var id = this.id || template.id;
            var wrapper = container || (id
                ? document.getElementById(id).parentNode
                : null
            );
            var positionObj = Object(position);

            if (!(wrapper instanceof Node)) { throw new TypeError('Please provide a container.'); }

            if (position === 'after') { wrapper.appendChild(template); }
            else if (position === 'before' || 'before' in positionObj) { wrapper.insertBefore(template, positionObj.before || wrapper.firstChild); }
            else { throw new TypeError(position + ' is not a valid position ("after", "before").'); }

            return this;

        },
        'append': function appendTo (container) {

            return this.insert('after', container);

        },
        'prepend': function prependTo (container) {

            return this.insert('before', container);

        },
        'reset': function resetProperties () {

            var originalProperties = this.original;

            Object.assign(this, originalProperties);

            return this;

        }

    });

    return View;

})();

module.exports = View;
