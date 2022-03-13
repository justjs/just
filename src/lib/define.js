var eachProperty = require('./eachProperty');
var loadElement = require('./loadElement');
var access = require('./access');
var defineProperties = require('./defineProperties');
var assign = require('./assign');
var define = (function () {

    var modules = {};
    var urls = {};
    var globals = {};
    var STATE_DEFINED = -1;
    var STATE_UPDATING = 0;
    var STATE_CALLING = 1;
    var STATE_READY = 2;
    var timeout;

    function generateID () {

        // Any value that's unique among values defined by the user is fine.
        return Math.random().toString().split('.')[1];

    }

    function dependsOf (mod, id) {

        if (!mod) { return false; }

        return mod.deps.some(function (depID) {

            return depID === id;

        });

    }

    function isReady (mod) {

        return mod && mod.state === STATE_READY;

    }

    function isWaiting (mod) {

        return mod && mod.state !== STATE_DEFINED;

    }

    function call (mod) {

        var id = mod.id;
        var deps = mod.deps;
        var handler = mod.exports;
        var isCallable, args;

        if (!isReady(mod)) {

            mod.state = STATE_UPDATING;

            isCallable = (
                deps.every(function (id) { return isReady(modules[id]); })
                || deps.every(function (id) { return isWaiting(modules[id]); })
            );

            if (isCallable) {

                args = deps.map(function (depID) {

                    var dep = modules[depID];
                    var isCircular = dep.id === id;
                    var isRecursive = dependsOf(dep, id);

                    if (isCircular) {

                        // Return the dependency instance.
                        return dep;

                    }

                    if (isRecursive) {

                        // Create and use a third module instead.
                        dep.id = generateID();
                        define(dep.id, [], mod.exports);

                        // Return the module instance.
                        return mod;

                    }

                    return dep.exports;

                });
                mod.state = STATE_CALLING;
                mod.exports = handler.apply(mod, args);
                mod.state = STATE_READY;

                return true;

            }

        }

        return false;

    }

    function update () {

        clearTimeout(timeout);

        timeout = setTimeout(function throttle () {

            try {

                eachProperty(modules, function callAndUpdate (mod) {

                    var called = call(mod);

                    if (called) {

                        update();

                        return true; // Stop.

                    }

                    return false; // Continue.

                });

            }
            catch (exception) { console.error(exception); }

        }, 0);

    }

    function load (id) {

        var url = urls[id];
        var urlDetails = Object(url);
        var tagName = (typeof url === 'string'
            ? (/\.js/.test(url) ? 'script' : 'link')
            : Object(urlDetails).tagName
        );
        var listener = function listener (e) {

            if (e.type === 'error') {

                console.error(new Error('Error loading ' + id + ': ' + url));

                return;

            }

            define(id, [], (id in globals
                ? globals[id]
                : access(window, id.split('.'))
            ));

        };

        loadElement(tagName, urlDetails, listener, function append (similar) {

            if (similar) { return listener.call(similar); }

            document.head.appendChild(this);

            return this;

        });

    }

    function Define (id, dependencies, value) {

        var state = (typeof value === 'function'
            ? STATE_DEFINED
            : STATE_READY
        );
        var deps = dependencies.map(function (id) {

            if (id in urls) { load(id); }

            return id;

        });

        assign(this, {
            'id': id,
            'deps': deps,
            'exports': value,
            'state': state
        });

        modules[id] = this;

        update();

    }

    function define () {

        var id = (arguments.length > 2 || typeof arguments[0] === 'string'
            ? arguments[0] + ''
            : generateID()
        );
        var deps = arguments[arguments.length > 2 || typeof arguments[0] === 'string'
            ? 1
            : 0
        ];
        var value = arguments[arguments.length > 2
            ? 2
            : 1
        ];

        if (!Array.isArray(deps)) { deps = []; }

        return new Define(id, deps, value);

    }

    defineProperties(define, {
        'urls': urls,
        'globals': globals,
        'clear': function () {

            // This is fine, as long as is not a member of `define`.
            modules = {};

        }
    });

    return define;

})();

module.exports = define;
