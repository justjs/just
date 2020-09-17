var addEventListener = require('./addEventListener');
var eachProperty = require('./eachProperty');
var defineProperties = require('./defineProperties');
var defaults = require('./defaults');
var check = require('./check');
var parseUrl = require('./parseUrl');
var Router = (function () {

    var location = window.location;
    var history = window.history;

    function Router () {

        Object.assign(this, {
            'routes': {}
        });

    }

    function testRoute (a, b) {

        return (a instanceof RegExp
            ? a.test(b)
            : a === b
        );

    }

    function onRoute (e) {

        var route = this;
        var pathObj = route.path;

        if (e.type === 'popstate') {

            e.detail = {
                'data': null,
                'route': {
                    'by': null,
                    'action': e.type
                }
            };

        }

        eachProperty(pathObj, function (path, by) {

            var route = this;
            var handler = route.handler;
            var options = route.options;
            var url = location[by];
            var ignore = options.ignore;
            var only = options.only;
            var actions = options.actions;
            var action = e.detail.route.action;
            var allowAction = actions.some(
                function (value) { return testRoute(value, action); }
            );
            /**
             * Make sure to call this just before calling the handler
             * to include the matched tokens in RegExp.
             * i.e: /(some)-route/ -> RegExp.$1 // > some
             */
            var isCurrentPath = testRoute(path, url);
            var detail = e.detail;
            var routeArg = detail.route;
            var result, stop;

            if (isCurrentPath
                && only.call(route)
                && !ignore.call(route)
                && allowAction) {

                if (!routeArg.by || routeArg.action === 'init') { routeArg.by = by; }
                result = handler.call(route, e, detail);
                stop = !result;

                return stop;

            }

        }, route);

    }

    defineProperties(Router, {

        'changeState': function changeState (action, url) {

            var currentOrigin = location.origin;
            var sameOrigin = parseUrl(url).origin === currentOrigin;
            var sameOriginPath = url.replace(currentOrigin, '');

            if (!sameOrigin) { return false; }

            try {

                if (action in history) { history[action](null, '', sameOriginPath); }
                else { location.hash = '#!' + sameOriginPath; }

            }
            catch (exception) { return false; }

            return true;

        },
        'replaceState': function replaceState (url) {

            return Router.changeState('replaceState', url);

        },
        'pushState': function pushState (url) {

            return Router.changeState('pushState', url);

        }

    });

    defineProperties(Router.prototype, {

        'trigger': function triggerAction (action, data, eventInit) {

            var routesObj = this.routes;

            eachProperty(routesObj, function (route, id) {

                var eventOptions = route.options.event;
                var eventTarget = eventOptions.target;
                var eventName = eventOptions.name;
                var defaultEventInit = eventOptions.init;
                var isInit = action === 'init';
                var event;

                if (isInit) {

                    if (route.init) { return false; }
                    route.init = true;

                }

                eventInit = defaults(eventInit, defaultEventInit, {'ignoreNull': true});
                eventInit.detail.data = data;
                Object.assign(eventInit.detail.route, {
                    'by': 'action',
                    'action': action
                });

                event = new CustomEvent(eventName, eventInit);
                eventTarget.dispatchEvent(event);

            });

        },
        'route': function route (id, path, handler, options) {

            var opts = defaults(options, {
                'ignore': function allowEverything () {},
                'only': function allowEverything () { return true; },
                'actions': [/.+/], // any.
                'event': {
                    'name': 'just:Router:route:' + id,
                    'target': document,
                    'init': {
                        'detail': {
                            'data': null,
                            'route': {
                                'by': null,
                                'action': null
                            }
                        }
                    }
                }
            }, {'ignoreNull': true});
            var eventOptions = opts.event;
            var eventName = eventOptions.name;
            var eventInit = eventOptions.init;
            var eventInitData = eventInit.detail.data;
            var eventTarget = eventOptions.target;
            var pathObj = (check(path, {})
                ? path
                : {'pathname': path}
            );
            var route = {
                'id': id,
                'path': pathObj,
                'originalPath': path,
                'handler': handler,
                'options': opts,
                'init': false
            };
            var listener = onRoute.bind(route);

            this.routes[id] = route;

            addEventListener(eventTarget, eventName, listener);
            addEventListener(window, 'popstate', listener);

            this.trigger('init', eventInitData, eventInit);

            return this;

        },
        'change': function changeState (action, url, data, eventInit) {

            if (Router.changeState(action, url)) {

                this.trigger(action, data, eventInit);

            }

            return this;

        },
        'push': function pushState (url, data, eventInit) {

            return this.change('pushState', url, data, eventInit);

        },
        'replace': function replaceState (url, data, eventInit) {

            return this.change('replaceState', url, data, eventInit);

        }

    });

    return Router;

})();

module.exports = Router;
