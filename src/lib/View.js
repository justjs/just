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

    function access (keys, data) {

        var allArgsSorted = [];
        var keysWithoutFunctions;
        var context;

        if (!keys) { return; }

        // We strip "(...[, ...])" from keys...
        keysWithoutFunctions = keys.replace(/((?:^|\.)[^.]+)\(([^)]*)\)/g,
            function replaceFunctions ($0, textBeforeParenthesis, textWithinParenthesis) {

                var replazableValues = {};
                // Replace naked vars within "()":
                var argsWithoutVars = textWithinParenthesis
                    .split(',')
                    .reduce(function (argsWithoutVars, argument, index) {

                        var arg = argument.trim();
                        var isNakedVar = isVar(arg);
                        var value = (isNakedVar
                            ? access(arg, data)
                            : arg
                        );

                        if (isNakedVar) {

                            replazableValues[index] = value;
                            value = JSON.stringify(value);

                        }

                        if (/^undefined$/.test(value)) {

                            replazableValues[index] = void 0;
                            value = null;

                        }

                        argsWithoutVars += value + ', ';

                        return argsWithoutVars;

                    }, '')
                    .replace(/, $/, '');
                // Use JSON.parse() to get valid data types:
                var parsableJSONString = '[' + argsWithoutVars + ']';
                var args = parseJSON(parsableJSONString);

                eachProperty(replazableValues, function (value, key) {

                    var index = parseInt(key);

                    this[index] = value;

                }, args);

                // ... and save its args for later (1).
                allArgsSorted.push(args);

                return textBeforeParenthesis;

            });

        return keysWithoutFunctions.split('.').reduce(
            function getValue (object, key) {

                var value = (key in Object(object)
                    ? Object(object)[key]
                    : key in String.prototype
                    ? String.prototype[key]
                    : void 0
                );
                var fn, args;
                var result = value;

                if (typeof value === 'function') {

                    fn = value;
                    args = allArgsSorted.shift(); // 1
                    result = fn.apply(context, args);

                }

                context = Object(result);

                return result;

            }, data);

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

                return (typeof value !== 'undefined'
                    ? value
                    : $0
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
        'getAliases': function getAliases (element, data, attributeName) {

            var attribute = element.getAttribute(attributeName);
            var aliases = {};
            var json;

            if (attribute) {

                json = stringToJSON(attribute);

                eachProperty(json, function (alias, key) {

                    this[alias] = access(key, data);

                }, aliases);

            }

            return aliases;

        },
        /**
         * Update views recursively when multiple data is
         * passed as a value.
         *
         * @param {Node} element - The target element.
         * @param {Object} data - The data.
         * @param {string} attributeName - The attribute containing the expression.
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
                object = access(objectProperty, data);

                if (Array.isArray(object)) {

                    // Loop each element of data.property
                    return (function (array) {

                        var i = 0;
                        var arrayLength = array.length;
                        var updatedViews = [];
                        var value, cachedView, view, viewData, isTheTemplate;

                        /*
                         * Call at least once to remove elements
                         * from the DOM, even if the array is empty.
                         */
                        do {

                            value = array[i];
                            cachedView = element.view;
                            view = cachedView || new View({
                                'element': element,
                                'attributes': newAttributeName
                            });
                            viewData = Object.assign({}, data);

                            /*
                             * Don't modify the view's data if the given
                             * array is empty.
                             */
                            if (arrayLength) {

                                viewData[varName] = value;

                            }

                            if (!cachedView && arrayLength) {

                                /*
                                 * Add a new element with the updates.
                                 * Make sure to don't alter the order in which
                                 * it was written. I.e.: Don't append() or prepend().
                                 */
                                view
                                    .create()
                                    .update(viewData)
                                    .insert({'before': element.nextSibling}, element.parentNode);

                                // And cache the view.
                                view.element.view = view;

                            }
                            else {

                                isTheTemplate = view.original.element === element;

                                /*
                                 * If we found a cached view or the given array
                                 * is empty, we remove its element from the DOM
                                 * to start from 0 again.
                                 */
                                if (!isTheTemplate && element.parentNode) { element.parentNode.removeChild(element); }

                                /*
                                 * ... View#update() will create the new updated
                                 * elements for us.
                                 */
                                view.update(viewData);

                            }

                            updatedViews.push(view);

                        } while (++i < arrayLength);

                        return updatedViews;

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
