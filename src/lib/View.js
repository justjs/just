var parseJSON = require('./parseJSON');
var defaults = require('./defaults');
var defineProperties = require('./defineProperties');
var eachProperty = require('./eachProperty');
var stringToJSON = require('./stringToJSON');
var findElements = require('./findElements');
var addEventListener = require('./addEventListener');
var assign = require('./assign');
var View = (function () {

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
     * Parse argument-like strings ("a, b, c") and return valid JSON values.<br>
     *
     * <aside class='note'>
     *   <h3>A few things to consider:</h3>
     *   <ul>
     *     <li>It supports dot notation on each argument. Eg: <code>a.b, b.c</code>.</li>
     *     <li>It doesn't support functions as arguments. Eg: <code>fn(function () {})</code>.</li>
     *     <li>It doesn't support variables in objects yet. Eg: <code>fn({"a": var}, [var])</code>).</li>
     *   </ul>
     *   <p>It uses JSON.parse internally.</p>
     * </aside>
     *
     * @typedef {function} just.View~parseArguments
     * @param {string} string - Argument-like string without quotes, like "a, b, c".
     * @param {object} data - Accessable data.
     * @example
     * parseArguments("a, b, c", {})
     * @returns {Array} Arguments.
     */
    function parseArguments (string, data) {

        var invalidJSONValues = {};
        var unparsedArgs = (',' + string + ',')
            // Match numbers, variables and reserved keywords.
            .replace(/,\s*([\w.-]+)\s*(?=,)/ig, function ($0, value, index) {

                var arg = (/^\d/.test(value)
                    ? parseFloat(value)
                    : value === 'this'
                    ? value
                    : access(value, data)
                );
                var requiresQuotes = typeof arg === 'object' && arg !== null
                    || typeof arg === 'string' && arg !== 'this';

                return ',' + (requiresQuotes
                    ? JSON.stringify(arg)
                    : arg
                );

            })
            // Remove extra commas.
            .replace(/^,|,$/g, '')
            // Replace invalid JSON values with a random/unique string.
            .replace(/(\b)(undefined|this)(\b)/g, function ($0, $1, value, $2) {

                var uniqueString = Math.random() + '';

                invalidJSONValues[uniqueString] = (value === 'this'
                    ? data[value]
                    : void 0
                );

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
     * @typedef {function} just.View~access
     * @param {string} keys - Accessable properties using the dot notation.
     * @param {?object} data - Accessable data.
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
        if (typeof keys !== 'string') { return keys; }

        /**
         * The way it works is by JSON.parsing things within parenthesis,
         * store each result in an array (<var>allArgsSorted</var>),
         * and removing parenthesis from the final string (<var>keysNoArgs</var>).
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
                var value = (key in contextObj
                    ? contextObj[key]
                    : key in String.prototype
                    ? String.prototype[key]
                    // Replace reserved keywords, numbers, objects, ...
                    : (
                        // If the given data is an object and the key is not undefined.
                        (typeof context === 'object' && context !== null)
                        && typeof key !== 'undefined' && key !== 'undefined'
                    )
                    ? parseJSON(key)
                    // Otherwise, return undefined.
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
     * Templarize elements easily.<br>
     *
     * <aside class='note'>
     *   <h3>Be careful:</h3>
     *   <p>Use <var>just.View</var> carefully and/or with a
     *   strong <a href='https://content-security-policy.com' rel='noopener noreferrer' target='_blank'>CSP policy</a>,
     *   as it replicates DOM elements found on each update. If templates are modified
     *   after writing them, all clones will suffer from those modifications.</p>
     * </aside>
     *
     * @class
     * @memberof just
     *
     * @param {?object} options - Any {@link just.View} property.
     * @param {just.View#id} options.id - Use either this or <var>element</var>.
     * @param {just.View#element} options.element - Use either this or <var>id</var>.
     * @param {just.View#data} options.data - Data available on all updates for this view.
     * @param {?string|just.View#attributes} [options.attributes=data-var] - <span id='~options~attributes'></span>Set it to a string to use it as a prefix or set it to an object with {@link just.View#attributes|this properties}.
     *
     * @example <caption>Generate elements based on one element.</caption>
     * <html>
     * <body>
     *   <ol>
     *     <li
     *       id='item'
     *       class='template'
     *       data-var-for='item in items as data-item'
     *       data-item-if='visible'
     *       hidden>
     *       <span
     *         data-item='${loop.index}. ${capitalize(item.text)} is visible!'
     *         data-item-attr='{
     *           "title": "Updated: ${updated}."
     *         }'></span>
     *     </li>
     *   </ol>
     *   <script src='/just.js'></script>
     *   <script>
     *     var view = new just.View({
     *       id: 'item',
     *       data: {
     *         capitalize: function (string) { return string[0].toUpperCase() + string.slice(1).toLowerCase(); },
     *         items: [{
     *           visible: true,
     *           text: 'first item'
     *         }, {
     *           visible: false,
     *           text: 'second item'
     *         }, {
     *           visible: true,
     *           text: 'third item'
     *         }]
     *       }
     *     });
     *
     *     // Do some work...
     *
     *     view.refresh({
     *       updated: new Date().toString()
     *     });
     *   </script>
     * </body>
     * </html>
     */
    function View (options) {

        var attributes = Object(options).attributes;
        var attributesPrefix = (typeof attributes === 'string'
            ? attributes
            : 'data-var'
        );
        var props = defaults(options, /** @lends just.View# */{
            /**
             * Id for the template element.
             * @type {?string}
             */
            'id': null,
            /**
             * The template element.
             * @type {?Node}
             */
            'element': null,
            /**
             * Data for this instance. Available on all updates.
             * @type {?object}
             */
            'data': {},
            /**
             * Updatable attributes. I.e: attributes that will be
             * updated when {@link just.View#update} gets called.
             *
             * <aside class='note'>
             *   <p><code>${prefix}</code> is the <a href='#~options~attributes'><var>attributes</var> argument's string</a> or "data-var".</p>
             * </note>
             *
             * @type {?object}
             * @property {string} [var=${prefix}] - The attribute for text replacements.
             * @property {string} [html=${prefix}-html] - The attribute for html replacements.
             * @property {string} [attr=${prefix}-attr] - The attribute for attribute replacements.
             * @property {string} [if=${prefix}-if] - The attribute for conditional/if replacements.
             * @property {string} [as=${prefix}-as] - The attribute for alias replacements. Scoping is not supported yet.
             * @property {string} [for=${prefix}-for] - The attribute for loops replacements. Only arrays are supported now.
             * @property {string} [on=${prefix}-on] - The attribute for listener replacements.
             */
            'attributes': {
                'var': attributesPrefix,
                'html': attributesPrefix + '-html',
                'attr': attributesPrefix + '-attr',
                'if': attributesPrefix + '-if',
                'alias': attributesPrefix + '-as',
                'for': attributesPrefix + '-for',
                'on': attributesPrefix + '-on'
            }
        }, {'ignoreNull': true});

        assign(this, props, /** @lends just.View# */{
            /**
             * Previous data set after a {@link just.View#update}.
             * @type {?object}
             */
            'previousData': null
        });

        /**
         * Original properties for this instance.
         * @type {?object}
         */
        this.original = assign({}, this);

    }

    defineProperties(View, /** @lends just.View */{
        /**
         * Default attribute to query elements in {@link just.View.init}.
         *
         * @type {string}
         * @readonly
         */
        'INIT_ATTRIBUTE_NAME': 'data-just-View',
        /**
         * Data available for all instances of {@link just.View}.
         *
         * @type {object}
         * @readonly
         */
        'globals': {},
        /**
         * Find elements with the {@link just.View.INIT_ATTRIBUTE_NAME} attribute,
         * parse its value as json, and call {@link just.View} with those options.<br>
         *
         * <aside class='note'>
         *   <h3>A few things to consider:</h3>
         *   <ul>
         *     <li>
         *       <p><var>options</var> support (nested) data replacement, using the <code>${}</code> sintax:</p>
         *       <ul>
         *         <li>
         *           <p>You can use <code>{"data": {"${key}": ["${get.value(0)}"]}}</code>
         *           to replace <code>${key}</code>, and <code>${get.value(0)}</code> with your own values
         *           defined in <var>View.globals</var> and <var>options.listeners</var>.</p>
         *         </li>
         *         <li>
         *           <p>You can use <var>this</var> to replace it with the current element. E.g: <code>${this.id}</code>.</p>
         *         </li>
         *         <li>
         *           <p>In current versions, you don't need to enclose <code>${}</code>
         *           in quotes to replace variables, since that's the only
         *           way you can replace them on stringified objects. I.e:</p>
         *           <ul>
         *             <li><code>{${var}: [${var}]}</code> is valid. (Equivalent to <code>{[var]: var})</code>.</li>
         *             <li><code>{"${var}": ["${var}"]}</code> is also valid, but different. (Equivalent to <code>{[`${var}`]: `${var}`}</code>).</li>
         *             <li><code>{var: [var]}</code> is invalid (for now), and will throw an error.</li>
         *           </ul>
         *           <p><em>Since replacements are sometimes required, you can use
         *           that sintax for now, but in the future, that sintax
         *           is likely to be removed.</em></p>
         *         </li>
         *       </ul>
         *     </li>
         *     <li>
         *       <p>Default values for undefined replacements are <code>null</code>:</p>
         *       <p>E.g: <code>["one", "two", ${three}]</code>. If <var>three</var> is undefined, the
         *       result will be <code>["one", "two", null]</code>.</p>
         *       <p>E.g: <code>"Hello ${world}!"</code>. If <var>world</var> is undefined, the result
         *       will be <code>"Hello null!"</code>.</p>
         *     </li>
         *   </ul>
         * </aside>
         *
         * @param {object} options
         * @param {object} options.listeners - Listeners for the {@link View#attachListeners} call.
         * @example <caption>Generate elements based on one element using minimum javascript.</caption>
         * <html>
         * <body
         *     data-just-View='{"element": ${this}}'
         *     data-var-on='{"init": "onInit"}'>
         *   <ol>
         *     <li
         *       id='item'
         *       class='template'
         *       data-var-for='item in items as data-item'
         *       data-item-if='visible'
         *       data-just-View='{
         *         "element": ${this},
         *         "data": {
         *           "items": [{
         *             "visible": true,
         *             "text": "first item"
         *           }, {
         *             "visible": false,
         *             "text": "second item"
         *           }, {
         *             "visible": true,
         *             "text": "third item"
         *           }]
         *         }
         *       }'
         *       hidden>
         *       <span
         *         data-item='${loop.index}. ${capitalize(item.text)} is visible!'
         *         data-item-attr='{
         *           "title": "Updated: ${updated}."
         *         }'></span>
         *     </li>
         *   </ol>
         *   <script src='/just.js'></script>
         *   <script>
         *     just.View.init({
         *       listeners: {
         *         onInit: function (e) {
         *           // This will refresh all [data-var] attributes.
         *           this.view.refresh(e.detail);
         *         }
         *       }
         *     });
         *
         *     // Trigger the "init" event:
         *     document.body.dispatchEvent(
         *       new CustomEvent('init', {
         *         detail: {
         *           updated: new Date().toString()
         *         }
         *       })
         *     );
         *   </script>
         * </body>
         * </html>
         * @returns {View[]} The created views.
         */
        'init': function (options) {

            var opts = defaults(options, {
                'listeners': {}
            });
            var listeners = opts.listeners;
            var attributeName = View.INIT_ATTRIBUTE_NAME;
            var elements = findElements('[' + attributeName + ']');
            var data = assign({}, View.globals, listeners);

            return elements.map(function (element) {

                var attributeValue = element.getAttribute(attributeName);
                var nestedVarsData = assign({'this': element}, data);
                var stringifiedJSON = View.replaceVars(attributeValue, nestedVarsData, null);
                var options = stringToJSON(stringifiedJSON);
                var view = new View(options).attachListeners(listeners);

                // Store/Cache it.
                element.view = view;

                return view;

            });

        },
        /**
         * Parse an attribute as a json and set keys as
         * event names/types and values as listeners.
         *
         * Values are {@link just.View~access|accessable} properties
         * that require a function as final value.
         *
         * @param {Node} element - The target element.
         * @param {!object} data - Data for the accessable properties, containing the listeners.
         * @param {!string} attributeName - Name of the attribute that contains the parseable json.
         * @returns {!object} The attached listeners, with <var>event.type</var>s as keys.
         */
        'attachListeners': function attachListeners (element, data, attributeName) {

            var attributeValue = element.getAttribute(attributeName);
            var attachedListeners = {};
            var json;

            if (attributeValue) {

                json = stringToJSON(attributeValue);

                eachProperty(json, function (value, eventType) {

                    var properties = value.split('.');
                    // Remove the last property to prevent executing the function on View~access().
                    var lastProperty = properties.pop();
                    var property = properties.join('.');
                    // Once accessed, we can safely access the last property to return the listener.
                    var listener = (property
                        ? access(property, data)[lastProperty]
                        : data[lastProperty]
                    );

                    addEventListener(this, eventType, listener);

                    attachedListeners[eventType] = listener;

                }, element);

            }

            return attachedListeners;

        },
        /**
         * Access to an object and return its value.
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
                resolvedValue = View.resolveConditional(conditional, data);

                return resolvedValue;

            }

            eachProperty(conditionalsObj, function (value, conditional) {

                var isTruthy = View.resolveConditional(conditional, data);

                // Return at first match.
                if (isTruthy) { return (resolvedValue = value); }

            });

            return resolvedValue;

        },
        /**
         * Replace placeholders (<code>${}</code>, eg. <code>${deep.deeper}</code>) within a string.<br>
         *
         * <aside class='note'>
         *   <h3>A few things to consider:</h3>
         *   <p>The following is supported:</p>
         *   <ul>
         *     <li>Functions<sup><a href='#.replaceVars[1]'>[1]</a></sup>: <code>${deep.deeper(1, "", myVar, ...)}</code></li>
         *     <li>String methods: <code>${do.trim().replace('', '')}</code>.</li>
         *     <li>Deep replacements: <code>${a.b.c}</code> or <code>${a.b().c()}</code></li>
         *   </ul>
         *   <footer><p><span id='.replaceVars[1]'>[1]</span>: Neither functions nor ES6+ things as arguments
         *   (like Symbols or all that stuff) are supported yet.</p></footer>
         * </aside>
         *
         * @param {?string|?object} value - Some text or an object.
         *        If an object is given, it will {@link just.View.resolveConditionals} first,
         *        then replace <code>${placeholders}</code> within the accessed value.
         * @param {?object} data - An object containing the data to be replaced.
         * @param {*} defaultValue - By default, it skips replacements if some accessed value is undefined.
         *                           Any other value will be stringified (returned to the String#replace function).
         * @example <caption>Using a string</caption>
         * View.replaceVars('${splitted.property}!', {
         *     'splitted': {'property': 'hey'}
         * }); // > "hey!"
         *
         * @example <caption>Using an object</caption>
         * View.replaceVars({
         *     'a': 'Show ${a}',
         *     'b': 'Show ${b}'
         * }, {'b': 'me (b)'}); // > "Show me (b)"
         *
         * @example <caption>Inexistent property</caption>
         * View.replaceVars("Don't replace ${me}!") // "Don't replace ${me}!"
         *
         * @example <caption>Setting a default value for an inexistent property</caption>
         * View.replaceVars('Replace ${me}', null, 'who?') // "Replace who?"
         *
         * @returns {string} The replaced string.
         *          If some value is undefined, it won't be replaced at all.
         */
        'replaceVars': function replaceVars (value, data, defaultValue) {

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
                var defaultReplacement = (typeof defaultValue !== 'undefined'
                    ? defaultValue
                    : placeholder
                );
                var isDefined = typeof value !== 'undefined';
                var requiresQuotes = isDefined
                    && typeof value !== 'string'
                    && typeof value !== 'number'
                    && value !== null;

                return (isDefined
                    ? (requiresQuotes ? JSON.stringify(value) : value)
                    : defaultReplacement
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

            data = Object(data);

            if (!('this' in data)) { data.this = element; }

            text = View.replaceVars(attribute, data);

            return Boolean(text !== attribute
                ? set(element, text)
                : false
            );

        },
        /**
         * Update the element's markup using {@link just.View.updateVars}
         * and <code>element.innerHTML</code>.
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
         * <code>"currentItem in accessed.array[ as updatableAttribute][,[ cache=true]]"</code>.
         *
         * <p>Where text enclosed in brackets is optional, and:</p>
         * <ul>
         *   <li><var>currentItem</var> is the property containing the current iteration data.
         *   <li><var>accessed.array</var> is a property to be {@link just.View.access|accessed} that contains an array as value.
         *   <li><var>updatableAttribute</var> is the name of the attribute that will be updated afterwards by {@link View#update}.
         *   <li>Setting <var>cache</var> will update existing elements, using each element as template. By default, this is <var>true</var>
         *   because it improves performance, but it also means that new modifications to each element will be replicated. If you set this
         *   to <var>false</var>, all generated elements will be removed before updating them, causing new modifications to be removed,
         *   but also hurting performance.
         * </ul>
         *
         * @example
         * "item in some.items"
         * // Will iterate over `some.items`, set `item` to each element (some.items[0], some.items[1], and so on...), and make `item` available under the default attribute.
         *
         * @example
         * "item in some.items as data-item"
         * // Will iterate over `some.items`, set `item` to each element, and make `item` available under the [data-item] attribute only.
         *
         * @example
         * "item in some.items as data-item, cache=false"
         * // Will iterate over `some.items`, set `item` to each element, make `item` available under the [data-item] attribute only, and recreate each element instead of updating it.
         *
         * @typedef {string} just.View.updateLoops_expression
         */
        /**
         * Loop data. Contains loop data for the current iteration.
         *
         * @typedef {!object} just.View.updateLoops_loopData
         * @property {number} index - The current index.
         * @property {array} array - The array.
         * @property {number} length - The array's length.
         * @property {number} left - Left elements' count.
         */

        /**
         * Iterate over an array to create multiple elements
         * based on a given template (<var>element</var>),
         * append them in order, and update each generated element.<br>
         *
         * <aside class='note'>
         *   <h3>A few things to consider:</h3>
         *   <ul>
         *     <li>New elements will contain the <var>element</var>'s id as a class,
         *     the "template" class will be removed, and the "hidden" attribute
         *     will be removed too.</li>
         *     <li>Loop data is exposed under the <var>loop</var> property on the updatable elements.
         *     See {@link just.View.updateLoops_loopData}.</li>
         *   </ul>
         * </aside>
         *
         * @param {Node} element - The target element.
         * @param {Object} data - The data.
         * @param {string} attributeName - The attribute containing the {@link just.View.updateLoops_expression|loop expression}.
         *
         * @returns {?View[]} The updated views or null.
         */
        'updateLoops': function updateLoops (element, data, attributeName) {

            var attributeValue = element.getAttribute(attributeName);
            var attributeParts = (attributeValue || '').split(/\s*,\s*/);
            var expression = attributeParts[0];
            var opts = (attributeParts[1] || '').split(' ').reduce(function (options, option) {

                var parts = option.split('=');
                var key = parts[0];
                var value = parts[1];

                options[key] = (/false/.test(value)
                    ? false
                    : true
                );

                return options;

            }, {
                'cache': true // Cache by default.
            });
            var cache = opts.cache;
            var objectProperty, varName, newAttributeName, object;

            // var in data.property as attribute
            if (/(\S+)\s+in\s+(\S+)(?:\s+as\s+(\S+))?/i.test(expression)) {

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

                        /**
                         * Prefer the template's parent node over the element's parent node
                         * to avoid empty values for element.parentNode (when element
                         * is not connected to the DOM, for example).
                         */
                        var parent = (element.view
                            ? element.view.original.element.parentNode
                            : element.parentNode
                        );
                        var arrayLength = array.length;
                        var children = [].slice.call(parent.children);
                        var viewData = assign({}, data);
                        var cachedViews = children.reduce(function (views, child) {

                            var cachedView = child.view;

                            if (cachedView && cachedView.element !== element) { views.push(cachedView); }

                            return views;

                        }, []);
                        var cachedView, view, child;

                        while (cache
                            // Remove extra elements to match array.length.
                            ? cachedViews.length > arrayLength
                            // Remove all elements to recreate them.
                            : cachedViews.length > 0
                        ) {

                            cachedView = cachedViews.pop();
                            child = cachedView.element;

                            try { child.parentNode.removeChild(child); }
                            catch (e) { console.error(e); }

                        }

                        // Create necessary elements to match array.length.
                        while (cachedViews.length < arrayLength) {

                            view = new View({
                                'element': element,
                                'attributes': newAttributeName
                            }).create().append(parent);

                            // Remove loop attribute to prevent recursive looping on update.
                            view.element.removeAttribute(attributeName);

                            // Cache.
                            view.element.view = view;
                            cachedViews.push(view);

                        }

                        // Once cachedViews.length and array.length are the same, update views as usual.
                        return cachedViews.map(function (cachedView, i) {

                            viewData[varName] = array[i];
                            viewData.this = cachedView.element;
                            viewData.loop = {
                                'index': i,
                                'array': array,
                                'length': arrayLength,
                                'left': arrayLength - i
                            };

                            return cachedView.update(viewData);

                        });

                    })(object);

                }

            }

            return null;

        }

    });

    defineProperties(View.prototype, /** @lends just.View# */{

        /**
         * @returns {@link just.View#element} or query element by {@link just.View#id}.
         */
        'getElement': function getElement () {

            return this.element || document.getElementById(this.id);

        },
        /**
         * Merges all available data into one object in the following
         * order: {@link just.View.globals}, {@link just.View#data}, <var>currentData</var>, and {@link just.View.getAliases|aliases}.
         *
         * @param {!object} currentData - It merges this object after globals, and locals, and before setting aliases.
         * @returns {!object}
         */
        'getData': function getAvailableData (currentData) {

            var element = this.getElement();
            var globals = View.globals;
            var locals = this.data;
            var attributeForAliases = this.attributes.alias;
            var elementsWithAliases = findElements('[' + attributeForAliases + ']', element)
                .concat(element);

            return elementsWithAliases.reduce(function (data, element) {

                return assign(data, View.getAliases(
                    element,
                    data,
                    attributeForAliases
                ));

            }, assign({}, globals, locals, currentData));

        },
        /**
         * Find all elements that contain a {@link just.View.attributes|supported attribute}
         * and return them.
         *
         * @param {?Node} [container|document]
         * @returns {Node[]} All matching elements within the given container
         */
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
        /**
         * Create a clone of an {@link just.View#getElement|element},
         * remove the .template class, the [hidden] attribute, and the [id]
         * after setting it as a class on the clon.
         *
         * Set {@link just.View#element} to the new clon and return
         * the current instance.
         *
         * @throws {TypeError} if {@link just.View#getElement|the template} is not a Node.
         * @chainable
         */
        'create': function createTemplate () {

            var template = this.getElement();
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
        /**
         * Update all updatable elements by querying them and calling
         * all possible update* functions, like:
         * - {@link just.View.updateConditionals}.
         * - {@link just.View.updateAttributes}.
         * - {@link just.View.updateHtmlVars}.
         * - {@link just.View.updateVars}.
         * - {@link just.View.updateLoops}.
         * (In that order).
         *
         * @param {*} data - Data for the update. Merged with {@link just.View#getData()}.
         * @param {?function} skip - A function called on each updatable element.
         *                           if a truthy value is returned, the update won't take place.
         * @chainable
         */
        'update': function updateTemplate (data, skip) {

            var element = this.getElement();
            var allData = this.getData(data);
            var attributes = this.attributes;
            var attributeForIf = attributes.if;
            var attributeForAttributes = attributes.attr;
            var attributeForHtml = attributes.html;
            var attributeForVars = attributes.var;
            var attributeForLoops = attributes.for;
            var updatableElements;

            if (!element) { return this; }

            this.previousData = data;

            updatableElements = this
                .getUpdatables(element)
                .concat(element);

            updatableElements.forEach(function (element) {

                if (typeof skip === 'function' && skip(element)) { return; }

                View.updateConditionals(element, allData, attributeForIf);
                View.updateAttributes(element, allData, attributeForAttributes);
                View.updateHtmlVars(element, allData, attributeForHtml);
                View.updateVars(element, allData, attributeForVars);
                View.updateLoops(element, allData, attributeForLoops);

            });

            return this;

        },
        /**
         * Update the view using {@link just.View#previousData} (set
         * on {@link just.View#update|update}) and <var>newData</var>.
         *
         * Useful to update the view with previous values or
         * update only some properties, after a normal {@link just.View#update|update}.
         *
         * @param {*} newData - Any new data.
         * @param {just.View#update~skip} skip - {@link just.View#update|skip} argument.
         * @chainable
         */
        'refresh': function (newData, skip) {

            var previousData = this.previousData;
            var data = assign({}, previousData, newData);

            this.update(data, skip);

            return this;

        },
        /**
         * Insert {@link just.View#element} at the given <var>position</var>
         * into the given <var>container</var>.
         *
         * @param {string|object<{before: Node}>} position -
         *        - <code>"before"</code> will insert the element before the first child.
         *        - <code>{"before": Node}</code> will insert the element before the given Node.
         *        - else (other values): will use <code>appendChild()</code> by default.
         * @param {?Node} container - The Node that will contain the element.
         *
         * @throws {TypeError} if a container can't be guessed.
         * @chainable
         */
        'insert': function insert (position, container) {

            var element = this.getElement();
            var wrapper = container || Object(this.id
                ? document.getElementById(this.id)
                : this.element
            ).parentNode;
            var positionObj = Object(position);

            if (!(wrapper instanceof Node)) { throw new TypeError('Please provide a container.'); }

            else if (position === 'before' || 'before' in positionObj) { wrapper.insertBefore(element, positionObj.before || wrapper.firstChild); }
            else { wrapper.appendChild(element); }

            return this;

        },
        /**
         * Call {@link just.View#insert} to perform an append
         * of the current template element.
         *
         * @param {?Node} container
         */
        'append': function appendTo (container) {

            return this.insert('after', container);

        },
        /**
         * Call {@link just.View#insert} to perform an prepend
         * of the current template element, at the beginning.
         *
         * @param {?Node} container
         */
        'prepend': function prependTo (container) {

            return this.insert('before', container);

        },
        /**
         * Restore constructor to its default value.
         * Use the #original property to restore it.
         *
         * @chainable
         */
        'reset': function resetProperties () {

            var originalProperties = this.original;

            assign(this, originalProperties);

            return this;

        },
        /**
         * Call {@link just.View.attachListeners}.
         *
         * @param {?object} listeners - An object in the format: <code>{eventType: fn}</code>.
         * @chainable
         */
        'attachListeners': function attachListeners (listeners) {

            var element = this.getElement();
            var attributeName = this.attributes.on;
            var data = this.getData(listeners);

            View.attachListeners(element, data, attributeName);

            return this;

        }

    });

    return View;

})();

module.exports = View;
