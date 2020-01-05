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
    var defaultErrorHandler = function (exception) { console.error(exception); };
    var timeout;

    function defineAlias (id, alias) {

        return new Define(alias, [id], function (value) { return value; });

    }

    function loadModule (id, onLoad) {

        var isKnownUrl = id in Define.urls;
        var knownUrl = Define.urls[id];
        var global = Define.globals[id];
        var url = isKnownUrl ? knownUrl : id;
        var URL = parseUrl(url);
        var urlExtension = (URL.pathname.match(/\.(.+)$/) || ['js'])[0];
        var type = (/css$/i.test(urlExtension) ? 'link' : 'script');
        var listener = (typeof onLoad === 'function'
            ? onLoad
            : function (e) { if (e.type === 'error') { Define.handleError.call(null, new Error('Error loading ' + url)); } }
        );

        if (url in modules) { return false; }
        if (url !== id) { defineAlias(id, url); }
        if (typeof global === 'string') { defineAlias(url, global); }

        return loadElement(type, url, function (e) {

            var global = Define.globals[id];
            var nonScript = Define.nonScripts[id];

            if (e.type !== 'error') {

                if (id in Define.globals) { new Define(id, [], typeof global !== 'string' ? global : access(window, global.split('.'))); }
                if (id in Define.nonScripts) { new Define(id, [], nonScript); }

            }

            listener.call(this, e);

        }, function (similarScript) {

            if (similarScript) { return false; }
            if (type !== 'script' && !(id in Define.nonScripts)) { Define.nonScripts[id] = this; }

            document.head.appendChild(this);

            return true;

        });

    }

    function getModule (id) {

        return (!isModuleDefined(id) && id in Define.urls
            ? (loadModule(id), null)
            : modules[id]
        ) || null;

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

        if (wereCalled(dependencies) || isEveryDependencyWaiting) {

            args = dependencies.map(function (d) { return d.returnedValue; });
            module.state = Define.STATE_CALLING;

            try { module.returnedValue = handler.apply(module, args); }
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

        return id && typeof id === 'string';

    }

    function isModuleDefined (id) {

        return id in modules;

    }

    /**
     * A module loader: it loads files when needed and
     * execute them when all his dependencies became available.
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
     *             be defined in {@link just.Define.urls} in order to be loaded.</li>
     *
     *         <li><var>require</var>, <var>module</var> and <var>exports</var>
     *             are not present in this loader.</li>
     *
     *         <li>Recursive and circular dependencies pass a recursive module
     *            as argument within another recursive module (instead of the returned value).
     *            Please, avoid using them or use them carefully.</li>
     *
     *         <li>Anonymous modules are not allowed.</li>
     *     </ul>
     * </aside>
     *
     * @class
     * @memberof just
     * @param {!string} id - The module id.
     * @param {string[]|string} dependencyIDs - Required module ids.
     * @param {*} value - The module value.
     *
     * @example
     * var files = just.Define.findInDocument('data-files');
     * var fileIDs = Object.keys(files);
     *
     * just.Define.load(files);
     * just.Define('some id', fileIDs, function (file1, file2, ...) {
     *     // Loads after all ids have been defined.
     * });
     */
    function Define (id, dependencyIDs, value) {

        if (!(this instanceof Define)) { return new Define(id, dependencyIDs, value); }
        if (!isValidID(id)) { throw new TypeError('The id must be a non-empty string.'); }

        if (typeof value === 'undefined') {

            value = arguments[1];
            dependencyIDs = [];

        }
        else if (dependencyIDs && !Array.isArray(dependencyIDs)) {

            dependencyIDs = [dependencyIDs];

        }
        else if (!dependencyIDs) {

            dependencyIDs = [];

        }

        if (dependencyIDs.some(
            function (id) { return !isValidID(id); }
        )) { throw new TypeError('If present, the ids for the dependencies must be non-empty strings.'); }

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
            'returnedValue': {
                'value': (typeof value === 'function' ? this : value),
                'writable': true
            }
        });

        (function updateModules () {

            clearTimeout(timeout);

            timeout = setTimeout(function () {

                eachProperty(modules, function (module) {

                    if (callModule(module)) { return updateModules(), true; }

                });

            });

        })();

    }

    defineProperties(Define, /** @lends just.Define */{
        /**
         * The initial value for all defined modules.
         *
         * @property {number}
         * @readOnly
         */
        'STATE_DEFINED': -1,
        /**
         * The value for all modules that had been queued
         * prior to be called.
         *
         * @property {number}
         * @readOnly
         */
        'STATE_NON_CALLED': 0,
        /**
         * The value for all modules that are being called.
         *
         * @property {number}
         * @readOnly
         */
        'STATE_CALLING': 1,
        /**
         * The value for all modules that were called.
         *
         * @property {number}
         * @readOnly
         */
        'STATE_CALLED': 2,
        /**
         * An writable object literal containing alias for keys and
         * urls as values.<br/>
         *
         * If you need to load files when you require some id,
         * you need to specify those urls here. If you do so, you
         * must {@link just.Define|Define} that id/url within that file.
         *
         * @example
         * // index.js
         * Define.urls['b'] = 'js/b.js';
         * Define('a', ['b'], function (b) {
         *     // b === 1; > true
         * });
         *
         * // js/b.js
         * Define('b', 1); // or: Define('js/b.js', 1);
         *
         * @example <caption>Using multiple ids with the same url</caption>
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
         * // js/index.js
         * Define('foo', 1);
         * Define('bar', 1);
         *
         * @property {!object.<just.Define~id, url>}
         */
        'urls': {
            'value': {},
            'writable': true
        },
        /**
         * A writable object literal that contains values for non script
         * resources, like css. Since {@link just.Define|Define} won't
         * check for file contents when loads a new file, you must add
         * the value here.
         *
         * @example
         * Define.nonScripts['/css/index.css'] = function () {};
         * Define('load css', ['/css/index.css'], function (css) {
         *     // by default, `css` is an HTMLElement (the link element that loaded the file).
         *     // but for now, `css` is a function.
         * });
         *
         * @property {!object.<just.Define~id, *>}
         */
        'nonScripts': {
            'value': {},
            'writable': true
        },
        /**
         * A writable object literal that contains all the values that
         * will be defined when a file loads.<br/>
         *
         * Note: If the value for the global is a string, the property
         * will be accessed from window. I.e.:<br/>
         * <var>'some.property'</var> will access to <var>window.some.property</var>.
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
         * @property {!object.<just.Define~id, *>}
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
         */
        'clearModule': function (id) { delete modules[id]; },
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
         */
        'init': function loadUrlsFromDocument () {

            var urls = Define.findUrlsInDocument('data-just-Define');

            Object.assign(Define.urls, urls);

            if ('main' in Define.urls) { Define.load('main'); }

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
