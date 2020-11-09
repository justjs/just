var parseJSON = require('./parseJSON');
var defaults = require('./defaults');
var defineProperties = require('./defineProperties');
var eachProperty = require('./eachProperty');
var stringToJSON = require('./stringToJSON');
var findElements = require('./findElements');
var View = (function () {

    function access (keys, data) {

        var allParamsSorted = [];
        var keysWithoutFunctions;
        var context;

        if (!keys) { return; }

        // We strip "(...[, ...])" from keys...
        keysWithoutFunctions = keys.replace(/((?:^|\.)[^.]+)\(([^)]*)\)/g,
            function replaceFunctions ($0, textBeforeParenthesis, textWithinParenthesis) {

                // Replace naked vars within "()":
                var paramsWithoutVars = textWithinParenthesis.replace(/(^|,)\s*([a-z][^,]*)/ig,
                    function replaceVarsInParams ($0, textBeforeNakedVar, nakedVar) {

                        var value = access(nakedVar, data);
                        var parsableJSONString = JSON.stringify(value);

                        return textBeforeNakedVar + parsableJSONString;

                    });
                // Use JSON.parse() to get valid data types:
                var parsableJSONString = '[' + paramsWithoutVars + ']';
                var params = parseJSON(parsableJSONString);

                // ... and save its params for later (1).
                allParamsSorted.push(params);

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
                var fn, params;
                var result = value;

                if (typeof value === 'function') {

                    fn = value;
                    params = allParamsSorted.shift(); // 1
                    result = fn.apply(context, params);

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
         * @param {?string} condititional - Keys splitted by ".".
         *        Use "!" to negate a expression.
         *        Use "true" to return true.
         * @parma {?object} data - An object with the given keys.
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
        'replaceVars': function replaceVars (data, value) {

            var text = (typeof value === 'object'
                ? View.resolveConditionals(value, data)
                : value + ''
            );

            return text.replace(/\$\{([^}]+)\}/g, function ($0, key) {

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

            text = View.replaceVars(data, attribute);

            if (text !== attribute) { element.textContent = text; }

            return true;

        },
        'updateHtmlVars': function updateHtmlVars (element, data, attributeName) {

            var attribute = element.getAttribute(attributeName);
            var html;

            if (!attribute) { return false; }

            html = View.replaceVars(data, attribute);

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

                var value = View.replaceVars(data, attribute);

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
