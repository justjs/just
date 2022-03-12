var addEventListener = require('./addEventListener');
var eachProperty = require('./eachProperty');
var defineProperties = require('./defineProperties');
var defaults = require('./defaults');
var check = require('./check');
var parseUrl = require('./parseUrl');
var assign = require('./assign');
var Router = (function () {

    var location = window.location;
    var history = window.history;

    /**
     * Route a SPA easily.
     *
     * @class
     * @memberof just
     *
     * @example
     * // routes/router.js
     * const router = new Router();
     *
     * export default router;
     *
     * // routes/home.js
     * import router from './router.js';
     *
     * router.route('home', {
     *     'pathname': '/',
     *     'search': /\breload=([^&]+)/
     * }, (event, {route, data}) => {
     *
     *     const {action, by} = route;
     *     let reload;
     *
     *     if (by === 'search') {
     *         reload = RegExp.$1;
     *     }
     *
     *     if (/init|popstate/.test(action)) {
     *         // @TODO Call controllers.
     *     }
     *
     * });
     */
    function Router () {

        assign(this, {
            'routes': {}
        });

    }

    function testRoute (a, b) {

        return (a instanceof RegExp
            ? a.test(b)
            : a === b
        );

    }

    function callMatchingRoute (route, path, by, e) {

        var detail = e.detail;
        var detailObj = Object(detail);
        var routeArgObj = Object(detailObj.route);
        var handler = route.handler;
        var options = route.options;
        var url = location[by];
        var ignore = options.ignore;
        var only = options.only;
        var actions = options.actions;
        var action = routeArgObj.action;
        var allowAction = actions.some(
            function (value) { return testRoute(value, action); }
        );
        /**
         * Make sure to call this just before calling the handler
         * to include the matched tokens in RegExp.
         * i.e: /(some)-route/ -> RegExp.$1 // > some
         */
        var isCurrentPath = testRoute(path, url);
        var result, stop;

        if (isCurrentPath
            && only.call(route)
            && !ignore.call(route)
            && allowAction) {

            if (!routeArgObj.by || routeArgObj.action === 'init') { routeArgObj.by = by; }
            result = handler.call(route, e, detail);
            stop = !result;

            return stop;

        }

    }

    function callMatchingRoutes (route, e) {

        var pathObj = route.path;

        eachProperty(pathObj, function (path, by) {

            return callMatchingRoute(this, path, by, e);

        }, route);

    }

    function onRoute (e) {

        var route = this;

        if (e.type === 'popstate') {

            e.detail = {
                'data': null,
                'route': {
                    'by': null,
                    'action': e.type
                }
            };

        }

        callMatchingRoutes(route, e);

    }

    defineProperties(Router, /** @lends just.Router */{

        /**
         * Call a <var>window.history</var>'s function if available.
         * Otherwise, change the current url using <var>location.hash</var>
         * and prepending a hashbang (#!) to the url state.
         *
         * <aside class='note'>
         *     <p>Note: This function does not accept any arguments
         *     for pushState/replaceState because it's only intended
         *     to change the url without reloading.</p>
         * </aside>
         *
         * @param {string} action - "pushState" or "replaceState".
         * @param {url} url - A same-origin url.
         *
         * @return {boolean} `false` if something fails, `true` otherwise.
         */
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
        /**
         * Do a <var>history.replaceState</var> calling {@link just.Router.changeState}.
         *
         * @param {url} url - {@link just.Router.changeState}'s url param.
         * @return {boolean} {@link just.Router.changeState}'s returned value.
         */
        'replaceState': function replaceState (url) {

            return Router.changeState('replaceState', url);

        },
        /**
         * Do a <var>history.pushState</var> calling {@link just.Router.changeState}.
         *
         * @param {url} url - {@link just.Router.changeState}'s url param.
         * @return {boolean} {@link just.Router.changeState}'s returned value.
         */
        'pushState': function pushState (url) {

            return Router.changeState('pushState', url);

        }

    });

    defineProperties(Router.prototype, /** @lends just.Router# */{

        /**
         * Call a custom action on the current route by
         * triggering a CustomEvent on each given route.
         *
         * @param {string} action - Some string.
         * @param {*} data - Data for the triggered event.
         * @param {CustomEventInit} eventInit - Options for CustomEvent's eventInit argument.
         * @example
         * import router from 'routes/router.js';
         *
         * router.route('all', /./, (e, {route, data}) => {
         *
         *     const {action} = route;
         *
         *     if (action === 'my-action') {
         *         console.log(`triggered ${data} on any route!`); // > "triggered my-data on any route!"
         *     }
         *
         * });
         *
         * router.route('home', '/', () => {
         *
         *     if (action === 'my-action') {
         *         // ignored.
         *     }
         *
         * });
         *
         * router.constructor.pushState('/item');
         * router.trigger('my-action', 'my-data');
         *
         * @example <caption>You can go even further by converting all anchors
         * on your html into actions.</caption>
         *
         * // index.html with "/item/a/b/c" as a url.
         * <a href='#close'></a>
         *
         * // controllers/item.js
         * function closeItem ({event, target}) {
         *     console.log("I'm closing...");
         *     // @TODO Close.
         * }
         *
         * export {closeItem as close}
         *
         * // routes/item.js
         * import router from 'router.js';
         * import * as controller from '../controllers/item.js';
         *
         * router.route('item', {
         *     'pathname': /^\/item\//,
         *     'hash': /^#!\/item\// // Set backwards compability.
         * }, (e, {route, data}) => {
         *
         *     if (action === 'close') {
         *         controller.close(data);
         *     }
         *
         * });
         *
         * // listeners/link.js
         * import router from 'routes/router.js';
         *
         * // This is only for demostration purposes.
         * just.on(document, 'click', (event) => {
         *
         *     const {target} = event;
         *     const {hash} = target;
         *
         *     if (hash) {
         *
         *         let action = hash.slice(1);
         *         let data = {'event': e, target};
         *
         *         router.trigger(action, data);
         *
         *     }
         *
         * });
         *
         * // Then, click an anchor link and the corresponding controller
         * // will be called.
         * @chainable
         */
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
                assign(eventInit.detail.route, {
                    'by': 'action',
                    'action': action
                });

                event = new CustomEvent(eventName, eventInit);
                eventTarget.dispatchEvent(event);

            });

            return this;

        },
        /**
         * @typedef {function} just.Router~route_ignore
         *
         * @this {just.Router~route}
         *
         * @return {boolean} If `true`, the route won't be called.
         */
        /**
         * @typedef {function} just.Router~route_only
         *
         * @this {just.Router~route}
         *
         * @return {boolean} If `true`, the route will be called.
         */

        /**
         * Define a route, attach listeners (for "popstate"
         * and custom events), and trigger an "init" event.
         *
         * @param {string} id - Some unique string to identify the current route.
         * @param {string|RegExp|?object} path - A value that will match the current location.
         *        A string/RegExp is the same as passing {"pathname": string/RegExp}.
         *        An object must contain any <var>window.location</var>'s keys, like "search", "hash", ...
         * @param {function} handler - Some function that will be called when the route matches the current url.
         * @param {!object} options
         * @param {just.Router~route_ignore} [options.ignore=allowEverything()]
         * @param {just.Router~route_only} [options.only=allowEverything()]
         * @param {Array} [options.actions] - An array of allowed actions.
         *        You can pass an array of string/RegExps.
         * @param {!object} options.event
         * @param {string} [options.event.name=`just:Router:route:${id}`] - event.type for the CustomEvent.
         * @param {Node} [options.event-target=document] - The element to attach the event to.
         * @param {CustomEventInit} options.event.init - Values for the CustomEvent's eventInit argument.
         *        You can pass custom values for the "init" event in here.
         * @param {!object} options.event.init.detail
         * @param {*} [options.event.init.detail.data=null] - Custom data for the "init" event.
         * @param {!object} options.event.init.detail.route - Internal properties.
         * @param {?string} [options.event.init.detail.route.by=null] - A <var>window.location</var> key that matched the route ("pathname", ...).
         * @param {?string} [options.event.init.detail.route.action=null] - The triggered action to call this route.
         *        Actions triggered by default include "init" and "popstate".
         *
         * @chainable
         */
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
            addEventListener(window, 'popstate', function (e) {

                /**
                 * Trigger at the end of the browser event loop,
                 * as stated in MDN, to avoid calling it before
                 * any other event.
                 */
                setTimeout(function () {

                    listener.call(this, e);

                }.bind(this), 0);

            });

            this.trigger('init', eventInitData, eventInit);

            return this;

        },
        /**
         * Do a {@link just.Router.changeState} and trigger an action
         * if it succeds.
         *
         * @param {string} action - A valid {@link just.Router.changeState}'s action.
         * @param {url} url - The new url.
         * @param {*} data - Some data.
         * @param {CustomEventInit} eventInit - Options for the event.
         * @chainable
         */
        'change': function changeState (action, url, data, eventInit) {

            if (Router.changeState(action, url)) {

                this.trigger(action, data, eventInit);

            }

            return this;

        },
        /**
         * Trigger a "pushState" action by calling {@link just.Router#change}.
         *
         * @param {url} url - {@link just.Router#change}'s url argument.
         * @param {*} data - {@link just.Router#change}'s data argument.
         * @param {CustomEventInit} - {@link just.Router#change}'s eventInit argument.
         * @chainable
         */
        'push': function pushState (url, data, eventInit) {

            return this.change('pushState', url, data, eventInit);

        },
        /**
         * Trigger a "replaceState" action by calling {@link just.Router#change}.
         *
         * @param {url} url - {@link just.Router#change}'s url argument.
         * @param {*} data - {@link just.Router#change}'s data argument.
         * @param {CustomEventInit} - {@link just.Router#change}'s eventInit argument.
         * @chainable
         */
        'replace': function replaceState (url, data, eventInit) {

            return this.change('replaceState', url, data, eventInit);

        }

    });

    return Router;

})();

module.exports = Router;
