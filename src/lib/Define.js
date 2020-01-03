/** globals Promise */
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
            : function (e) { if (e.type === 'error') { throw new Error('Error loading ' + url); } }
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
        var args;

        if (wasCalled(module)) { return false; }

        module.state = Define.STATE_NON_CALLED;

        if (wereCalled(dependencies)) {

            args = dependencies.map(function (d) { return d.returnedValue; });
            module.state = Define.STATE_CALLING;
            module.returnedValue = handler.apply(module, args);
            module.state = Define.STATE_CALLED;

            return true;

        }

        return false;

    }

    function clearModules () {

        modules = {};

    }

    function clearModule (id) {

        delete modules[id];

    }

    function clear () {

        Define.globals = {};
        Define.nonScripts = {};
        Define.urls = {};
        clearModules();

    }

    function isValidID (id) {

        return id && typeof id === 'string';

    }

    function isModuleDefined (id) {

        return id in modules;

    }

    function Define (id, dependencyIDs, value) {

        var hasRecursiveDependencies, hasCircularDependencies;

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

        hasCircularDependencies = dependencyIDs.some(function (dID) { return dID === id; });
        hasRecursiveDependencies = dependencyIDs.some(function (dID) {

            return (Object(modules[dID]).dependencyIDs || []).some(
                function (ddID) { return ddID === id; }
            );

        });

        if (hasCircularDependencies
            || hasRecursiveDependencies) { throw new TypeError('Neither circular nor recursive dependencies are supported yet.'); }

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

    defineProperties(Define, {
        'STATE_DEFINED': -1,
        'STATE_NON_CALLED': 0,
        'STATE_CALLING': 1,
        'STATE_CALLED': 2,
        'urls': {
            'value': {},
            'writable': true
        },
        'nonScripts': {
            'value': {},
            'writable': true
        },
        'globals': {
            'value': {},
            'writable': true
        },
        'isDefined': isModuleDefined,
        'load': loadModule,
        'clear': clear,
        'clearModules': clearModules,
        'clearModule': clearModule,
        'init': function () { return Define.loadFromDocument('data-just-Define'); },
        'loadFromDocument': function (attributeName) {

            findElements('*[' + attributeName + ']').forEach(function (json) {

                Object.assign(Define.urls, stringToJSON(json));

                if ('main' in Define.urls) { loadModule('main'); }

            });

            return Define;

        }
    });

    return Define;

})();

onDocumentReady(Define.init);

module.exports = Define;
