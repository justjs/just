var findElements = require('./findElements');
var stringToJSON = require('./stringToJSON');
var loadElement = require('./loadElement');
var eachProperty = require('./eachProperty');
var defineProperties = require('./defineProperties');
var onDocumentReady = require('./onDocumentReady');
var parseUrl = require('./parseUrl');
var access = require('./access');
var Define = (function () {

    var modules = {};
    var defaultErrorHandler = function (exception) { throw exception; };
    var timeout;

    function defineAlias (id, alias) {

        if (isModuleDefined(alias)) { return false; }

        new Define(alias, [id], function (value) { return value; });

        return true;

    }

    function defineGlobal (id) {

        var global = Define.globals[id];
        var value = global;

        if (!(id in Define.globals) || isModuleDefined(id)) { return false; }
        if (typeof global === 'string') { value = function () { return access(window, global.split('.')); }; }

        new Define(id, [], value);

        return true;

    }

    function defineNonScript (id) {

        var nonScript = Define.nonScripts[id];
        var value = nonScript;

        if (!(id in Define.nonScripts) || isModuleDefined(id)) { return false; }

        new Define(id, [], value);

        return true;

    }

    function defineKnownModule (id, isLoaded) {

        if (isModuleDefined(id)) { return false; }

        if (id in Define.urls && !isLoaded) { return loadModule(id); }
        else if (id in Define.nonScripts) { return defineNonScript(id); }
        else if (id in Define.globals) { return defineGlobal(id); }

        return false;

    }

    function loadModule (id, onLoad) {

        var url = id in Define.urls ? Define.urls[id] : id;
        var URL = parseUrl(url);
        var urlExtension = (URL.pathname.match(/\.(.+)$/) || ['js'])[0];
        var type = (/css$/i.test(urlExtension) ? 'link' : 'script');

        if (!(id in Define.urls)) { Define.urls[id] = url; }
        if (url !== id) { defineAlias(id, url); }

        return loadElement(type, url, function (e) {

            var isError = Object(e).type === 'error';

            if (!isError) { defineKnownModule(id, true); }
            if (typeof onLoad === 'function') { return onLoad.call(this, e); }
            if (isError) { Define.handleError.call(null, new Error('Error loading ' + url)); }

        }, function (similarScript) {

            if (type !== 'script' && !(id in Define.nonScripts)) { Define.nonScripts[id] = this; }
            if (similarScript) { return false; }

            document.head.appendChild(this);

            return true;

        });

    }

    function getModule (id) {

        defineKnownModule(id);

        return modules[id] || null;

    }

    function getModules (ids) {

        return ids.map(function (id) { return getModule(id); });

    }

    function wasCalled (module) {

        return Object(module).state === Define.STATE_CALLED;

    }

    function wereCalled (modules) {

        return modules.every(function (module) { return wasCalled(module); });

    }

    function hasID (id, module) {

        return Object(module).id === id;

    }

    function hasCircularDependencies (module) {

        return module && module.dependencies.some(
            hasID.bind(null, module.id)
        );

    }

    function hasRecursiveDependencies (module) {

        return module && module.dependencies.some(function (d) {

            return d && d.dependencies.some(
                hasID.bind(null, this.id)
            );

        }, module);

    }

    function callModule (module) {

        var handler = module.handler;
        var dependencies = module.dependencies;
        var errorHandlerResult;
        var isEveryDependencyWaiting;
        var args;

        if (wasCalled(module)) { return false; }

        module.state = Define.STATE_NON_CALLED;
        isEveryDependencyWaiting = dependencies.every(
            function (d) { return d && d.state !== Define.STATE_DEFINED; }
        );

        if (wereCalled(dependencies) || isEveryDependencyWaiting && (
            hasCircularDependencies(module)
            || hasRecursiveDependencies(module)
        )) {

            args = dependencies.map(function (d) { return d.exports; });
            module.state = Define.STATE_CALLING;

            try { module.exports = handler.apply(module, args); }
            catch (exception) { errorHandlerResult = Define.handleError.call(module, exception); }

            module.state = Define.STATE_CALLED;

            return (typeof errorHandlerResult === 'boolean'
                ? errorHandlerResult
                : true
            );

        }

        return false;

    }

    function isValidID (id) {

        return typeof id === 'string' && id.trim() !== '';

    }

    function isModuleDefined (id) {

        return id in modules;

    }

    function isNullOrUndefined (value) {

        return value === null || typeof value === 'undefined';

    }

    /**
     * Define a value after all dependencies became available.
     *
     * <br/>
     * <aside class='note'>
     *     <h3>A few things to consider: </h3>
     *     <ul>
     *         <li>This is not intended to be AMD compliant.</li>
     *
     *         <li>This does not check file contents, so it won't check if the
     *             file defines an specific id.</li>
     *
     *         <li>Urls passed as dependencies are considered ids, so they must
     *             be defined in {@link just.Define.urls} in order to be loaded first.</li>
     *
     *         <li><var>require</var>, <var>module</var> and <var>exports</var>
     *             are not present in this loader, but you can emulate them.</li>
     *
     *         <li>Recursive and circular dependencies pass a recursive module
     *            as argument within another recursive module (instead of the returned value).
     *            Please, avoid using them or use them carefully.</li>
     *     </ul>
     * </aside>
     *
     * @class
     * @memberof just
     * @param {?string} id - The module id.
     * @param {string[]|string} dependencyIDs - Required module ids.
     * @param {*} value - The module value.
     *
     * @example
     * // https://some.cdn/js/just.js
     * window.just = {'Define': function () {}};
     *
     * // index.html
     * < !DOCTYPE html>
     * < html data-just-Define='{"main": "/js/main.js"}'>
     * < head>
     *    < title>Test</title>
     *    < script src='https://some.cdn/js/just.js' async></script>
     * < /head>
     * < body>
     * < /body>
     * < /html>
     *
     * // /js/main.js
     * just.configure({
     *    'globals': {
     *        // Set justJs to window.just
     *        'justJs': 'just'
     *    },
     *    'urls': {
     *        // Load "/css/index.css" when "index.css" is required.
     *        'index.css': '/css/index.css'
     *    },
     *    'nonScripts': {
     *        // Call when "main.html" is required.
     *        'main.html': function () { return '<main></main>'; }
     *    }
     * });
     *
     * // Load when document, justJs and index.css are ready:
     * just.Define('main', ['justJs', 'index.css'], function (j) {
     *
     *    if (j.supportsTouch()) {
     *        j.Define('mobile', 'https://example/m');
     *        return;
     *    }
     *
     *    j.Define('non-mobile', ['main.html']);
     *
     * });
     *
     * // Call only if j.supportsTouch()
     * just.Define(['mobile'], function (url) {
     *    window.redirect = url;
     * });
     *
     * // Call when main.html is ready.
     * just.Define(['non-mobile'], function (html) {
     *    document.body.innerHTML = html;
     * });
     */
    function Define (id, dependencyIDs, value) {

        if (!arguments.length || typeof value !== 'function' && [id, dependencyIDs].every(
            function (value) { return isNullOrUndefined(value); }
        )) {

            throw new TypeError('Not enough arguments.');

        }

        if (arguments.length === 2) {

            value = arguments[1];

            if (Array.isArray(arguments[0])) {

                dependencyIDs = arguments[0];
                id = void 0;

            }
            else {

                dependencyIDs = void 0;

            }

        }
        else if (arguments.length === 1) {

            if (typeof arguments[0] === 'function') {

                value = arguments[0];
                id = void 0;
                dependencyIDs = void 0;

            }

        }

        if (!isValidID(id)) {

            if (isNullOrUndefined(id)) { id = Math.random().toString(); }
            else { throw new TypeError('The given id (' + id + ') is invalid.'); }

        }

        if (isNullOrUndefined(dependencyIDs)) { dependencyIDs = []; }
        else if (!Array.isArray(dependencyIDs)) { dependencyIDs = [dependencyIDs]; }

        if (dependencyIDs.some(
            function (id) { return !isValidID(id); }
        )) { throw new TypeError('If present, the ids for the dependencies must be valid ids.'); }

        if (!(this instanceof Define)) { return new Define(id, dependencyIDs, value); }

        modules[id] = this;

        defineProperties(this, {
            'id': id,
            'handler': (typeof value === 'function'
                ? value
                : function () { return value; }
            ),
            'dependencyIDs': dependencyIDs,
            'dependencies': {
                'get': function () { return getModules(this.dependencyIDs); }
            },
            'state': {
                'value': Define.STATE_DEFINED,
                'writable': true
            },
            'exports': {
                'value': (typeof value === 'function' ? this : value),
                'writable': true
            }
        });

        clearTimeout(timeout);

        timeout = setTimeout(function updateModules () {

            eachProperty(modules, function (module) {

                if (callModule(module)) { return updateModules(), true; }

            });

        });

    }

    defineProperties(Define, /** @lends just.Define */{
        /**
         * The initial value for all defined modules.
         *
         * @type {number}
         * @readOnly
         */
        'STATE_DEFINED': -1,
        /**
         * The value for all modules that had been queued
         * prior to be called.
         *
         * @type {number}
         * @readOnly
         */
        'STATE_NON_CALLED': 0,
        /**
         * The value for all modules that are being called.
         *
         * @type {number}
         * @readOnly
         */
        'STATE_CALLING': 1,
        /**
         * The value for all modules that were called.
         *
         * @type {number}
         * @readOnly
         */
        'STATE_CALLED': 2,
        /**
         * A list of urls that will be used (instead of ids) to load
         * files before defining globals or non-script values.<br/>
         *
         * <aside class='note'>
         *     <h3>Note:</h3>
         *     <p>If you need to load files when you require some id,
         *        you need to specify those urls here. If you do so, you
         *        must {@link just.Define|Define} that id/url within that file.</p>
         * </aside>
         *
         * @example
         * // js/b.js
         * Define('b', 1); // or: Define('js/b.js', 1);
         *
         * // index.js
         * Define.urls['b'] = 'js/b.js';
         * Define('a', ['b'], function (b) {
         *     // b === 1; > true
         * });
         *
         * @example <caption>Using multiple ids with the same url</caption>
         * // js/index.js
         * Define('foo', 1);
         * Define('bar', 1);
         *
         * // index.js
         * Object.assign(Define.urls, {
         *     'foo': 'js/index.js',
         *     'bar': 'js/index.js'
         * });
         *
         * Define('foo-bar', ['foo', 'bar'], function () {
         *     // Will load js/index.js once.
         * });
         *
         * @type {!object.<just.Define~id, url>}
         */
        'urls': {
            'value': {},
            'writable': true
        },
        /**
         * A writable object literal that contains values for non script
         * resources, like css. Since {@link just.Define|Define} won't
         * check for file contents when loads a new file, you must add
         * the value here.</br>
         *
         * <aside class='note'>
         *     <h3>Note:</h3>
         *     <p>If a module is defined with the same id, the module will take
         *     precedence.</p>
         * </aside>
         *
         * @example
         * Define.nonScripts['/css/index.css'] = function () {};
         * Define('load css', ['/css/index.css'], function (css) {
         *     // by default, `css` is an HTMLElement (the link element that loaded the file).
         *     // but for now, `css` is a function since the id wasn't defined in Define.urls
         * });
         *
         * @type {!object.<just.Define~id, *>}
         */
        'nonScripts': {
            'value': {},
            'writable': true
        },
        /**
         * A writable object literal that contains all the values that
         * will be defined when required.<br/>
         *
         * <aside class='note'>
         *     <h3>Notes:</h3>
         *     <ul>
         *         <li>If the value for the global is a string, the property
         *             will be accessed from window. I.e.:
         *             <var>'some.property'</var> will access to <var>window.some.property</var>.
         *         </li>
         *         <li>If a module is defined with the same id, the module will take
         *             precedence.</li>
         *         <li>If a non-script is defined with the same id, a non-script value
         *          will take precedence.</li>
         *     </ul>
         * </aside>
         *
         * @example
         * // index.js
         * Define.globals['just'] = 1;
         * Define('index', ['just'], function (just) {
         *     // just === 1; > true
         * });
         *
         * @example <caption>Using a string.</caption>
         * // index.js
         * window.just = {Define: 1};
         * Define.globals['Define'] = 'just.Define';
         * Define('index', ['Define'], function (Define) {
         *     // Define === 1; > true
         * });
         *
         * @example <caption>Defining a global after a file load.</caption>
         * // https://some.cdn/js/just.js
         * window.just = {Define: 1};
         *
         * // main.js
         * Define.globals['JustJs'] = 'just';
         * Define.urls['JustJs'] = 'https://some.cdn/js/just.js';
         * Define('main', ['JustJs'], function (just) {
         *     // just === {Define: 1};
         * });
         *
         * @type {!object.<just.Define~id, *>}
         */
        'globals': {
            'value': {},
            'writable': true
        },
        /**
         * Check if a module is defined.
         *
         * @function
         * @return {boolean}
         */
        'isDefined': isModuleDefined,
        /**
         * Load a module explicitly.
         *
         * @function
         * @param {url|just.Define~id} id - Some url or an alias defined in {@link just.Define.urls}.
         * @param {?function} onLoad - Some listener to call when the function loads.
         */
        'load': loadModule,
        /**
         * Configure any writable option in {@link just.Define} using an object.
         *
         * @example
         * Define.configure({
         *     'urls': {}, // Same as Define.urls = {}
         *     'handleError': function () {}, // Same as Define.handleError = function () {}
         *     'load': 1 // Same as Define.load = 1 > throws Define.load is read-only.
         * })('id', [], function () {}); // Define afterwards.
         *
         * @function
         * @param {!object} properties - Writable properties from {@link just.Define}.
         * @chainable
         */
        'configure': function (properties) {

            Object.assign(Define, properties);

            return Define;

        },
        /**
         * Empty all internal variables and writable properties.
         *
         * @function
         * @chainable
         */
        'clear': function () {

            Define.globals = {};
            Define.nonScripts = {};
            Define.urls = {};
            Define.handleError = defaultErrorHandler;
            Define.clearModules();

            return Define;

        },
        /**
         * Remove all modules.
         *
         * @function
         * @chainable
         */
        'clearModules': function () { return (modules = {}), this; },
        /**
         * Remove some module.
         *
         * @function
         * @param {just.Define~id} id - The id for the module.
         * @chainable
         */
        'clearModule': function (id) { return (delete modules[id]), this; },
        /**
         * A function to be called when an async error occur.
         *
         * @function
         * @param {*} exception - Some throwable exception.
         * @this just.Define
         * @return {boolean} <var>true</var> if you want to keep updating modules.
         */
        'handleError': {
            'value': defaultErrorHandler,
            'writable': true
        },
        /**
         * Finds {@link just.Define.urls|urls} within the document, adds them, and
         * if some is called "main", it loads it.<br/>
         *
         * <aside class='note'>
         *     <h3>Note</h3>
         *     <p>This function is called when the file is loaded.</p>
         * </aside>
         *
         * @function
         * @chainable
         */
        'init': function loadUrlsFromDocument () {

            Define.configure({
                'urls': Define.findUrlsInDocument('data-just-Define')
            });

            if ('main' in Define.urls) { Define.load('main'); }

            return Define;

        },

        /**
         * Finds {@link just.Define.urls|urls} within the document
         * by selecting all the elements that contain an specific
         * attribute and parsing that attribute as a JSON.
         * <br/>
         * <aside class='note'>
         *     <h3>Note</h3>
         *     <p>Values within brackets will be replaced with
         *     actual attributes for that element.</p>
         *     <p>I.e.: &lt;span a='123' data-urls='{"[a]456": "[a]456"}'&gt;&lt;/span&gt;
         *     will become: {123456: '123456'}</p>
         * </aside>
         *
         * @function
         * @param {string} attributeName - The attribute which defines the
         *     {@link just.Define.urls|urls} to be loaded.
         * @param {Element} [container=document]
         *
         * @example
         * // Considering the following document:
         * < body>
         *     < div id='a' data-urls='{"[id]": "link a.css"}'>< /div>
         *     < script src='b.js' data-urls='{"b": "script [src]"}'>< /script>
         * < /body>
         *
         * // then, in js:
         * findUrlsInDocument('data-urls');
         * // Should return {a: 'link a.css', b: 'script b.js'}.
         *
         * @return {!just.Define.urls}
         */
        'findUrlsInDocument': function (attributeName, container) {

            var urls = {};

            findElements('*[' + attributeName + ']', container).forEach(function (element) {

                var attribute = element.getAttribute(attributeName) + '';
                var urls = stringToJSON(attribute.replace(/\[([^\]]+)\]/ig,
                    function (_, key) { return element.getAttribute(key); }
                ));

                Object.assign(this, urls);

            }, urls);

            return urls;

        }
    });

    defineProperties(Define.prototype, /** @lends just.Define# */{
        /**
         * Same as {@link Define.load}, but chainable.
         *
         * @function
         * @chainable
         */
        'load': function () {

            loadModule.apply(null, [].slice.call(arguments));

            return this;

        }
    });

    return Define;

})();

onDocumentReady(Define.init);

module.exports = Define;
