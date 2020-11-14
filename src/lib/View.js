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
                    .map(function (argument, index) {

                        var arg = argument.trim();
                        var isNakedVar = isVar(arg);
                        var isReserved = isReservedKeyword(arg);
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
                            /**
                             * We don't return null here because [].join
                             * removes the value and makes it unparsable
                             * anyway.
                             */

                        }

                        return value;

                    })
                    .join(', ')
                    .replace(/(^|,)(?:undefined|\s*)(,|$)/g, '$1null$2');
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
            'alias': attributesPrefix + '-as'
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

            var text = (typeof value === 'object'
                ? View.resolveConditionals(value, data)
                : value + ''
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
        'updateVars': function updateVars (element, data, attributeName) {

            var attribute = element.getAttribute(attributeName);
            var text;

            if (!attribute) { return false; }

            text = View.replaceVars(attribute, data);

            if (text !== attribute) { element.textContent = text; }

            return true;

        },
        'updateHtmlVars': function updateHtmlVars (element, data, attributeName) {

            var attribute = element.getAttribute(attributeName);
            var html;

            if (!attribute) { return false; }

            html = View.replaceVars(attribute, data);

            if (html !== attribute) { element.innerHTML = html; }

            return true;

        },
        'updateConditionals': function updateConditionals (element, data, attributeName) {

            var attribute = element.getAttribute(attributeName);
            var parentNode = element.parentNode;
            var value;

            if (!parentNode || !attribute) { return false; }

            value = View.resolveConditionals(attribute, data);
            if (!value) { parentNode.removeChild(element); }

            return true;

        },
        'updateAttributes': function updateAttributes (element, data, attributeName) {

            var attribute = element.getAttribute(attributeName);
            var attributes;

            if (!attribute) { return false; }

            attributes = stringToJSON(attribute);

            eachProperty(attributes, function (attribute, key) {

                var value = View.replaceVars(attribute, data);

                if (value !== attribute) { this.setAttribute(key, value); }

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

        }

    });

    defineProperties(View.prototype, {

        'getUpdatables': function queryAllUpdatables (container) {

            var attributes = this.attributes;
            var attributeForVars = attributes.var;
            var attributeForHtml = attributes.html;
            var attributeForIf = attributes.if;
            var attributeForAttributes = attributes.attr;

            return findElements([
                '[' + attributeForVars + ']',
                '[' + attributeForHtml + ']',
                '[' + attributeForIf + ']',
                '[' + attributeForAttributes + ']'
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

            });

            return this;

        },
        'refresh': function (newData, skip) {

            var previousData = this.previousData;
            var data = Object.assign({}, previousData, newData);

            this.update(data, skip);

            return this;

        },
        'insert': function insert (position, container) {

            var template = this.element;
            var id = this.id || template.id;
            var wrapper = container || (id
                ? document.getElementById(id).parentNode
                : null
            );

            if (!(wrapper instanceof Node)) { throw new TypeError('Please provide a container.'); }

            if (position === 'after') { wrapper.appendChild(template); }
            else if (position === 'before') { wrapper.insertBefore(template, wrapper.firstChild); }
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
