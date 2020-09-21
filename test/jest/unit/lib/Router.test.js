var Router = require('@lib/Router');

describe('@lib/Router.js', function () {

    describe('#route()', function () {

        it('Should route once.', function () {

            var router = new Router();
            var routeA = jest.fn();
            var routeB = jest.fn();
            var routeC = jest.fn();
            var currentOrigin = location.origin;
            var pathnameMock = jest
                .spyOn(window, 'location', 'get')
                .mockImplementation(function () { return {'pathname': '/', 'origin': currentOrigin}; });

            router.route('a', '/', routeA);
            router.route('b', '/B', routeB);
            router.route('c', '/C', routeC);

            expect(routeA).toBeCalledTimes(1);
            expect(routeB).toBeCalledTimes(0);
            expect(routeC).toBeCalledTimes(0);

            pathnameMock.mockRestore();

        });

        it('Should trigger an "init" action.', function () {

            var router = new Router();
            var routeFn = jest.fn();

            router.route('my-route', '/', routeFn);

            expect(routeFn).toHaveBeenCalledWith(
                expect.any(Event),
                expect.objectContaining({
                    'data': null,
                    'route': {
                        'by': 'pathname',
                        'action': 'init'
                    }
                })
            );

        });

    });

    describe('#trigger()', function () {

        var router, routeFn;

        beforeEach(function () {

            router = new Router();
            routeFn = jest.fn();
            router.route('id', '/', routeFn);

        });

        test.each([
            ['do-something', void 0, void 0, {
                'data': void 0,
                'route': {
                    'by': 'action',
                    'action': 'do-something'
                }
            }],
            ['do-it-with-data', {}, void 0, {
                'data': {},
                'route': {
                    'by': 'action',
                    'action': 'do-it-with-data'
                }
            }],
            ['do-it-with-event-init', '2nd argument', {
                'detail': {
                    'data': 'ignored',
                    'route': {
                        'by': 'ignored',
                        'action': 'ignored',
                        'custom': 'not ignored'
                    }
                }
            }, {
                'data': '2nd argument', // 2nd argument takes precedence.
                'route': {
                    'by': 'action',
                    'action': 'do-it-with-event-init',
                    'custom': 'not ignored'
                }
            }]
        ])('Should trigger custom actions.', function (action, data, eventInit, expectedArg) {

            router.trigger(action, data, eventInit);
            expect(routeFn).toHaveBeenCalledWith(
                expect.any(Event),
                expect.objectContaining(expectedArg)
            );

        });

    });

    describe('#change()', function () {

        test.each([
            ['pushState', '/a', void 0, void 0, {
                'data': void 0,
                'route': {
                    'action': 'pushState',
                    'by': 'action'
                }
            }],
            ['replaceState', '/b', 'some data', {
                'detail': {
                    'custom': 'not ignored'
                }
            }, {
                'data': 'some data',
                'custom': 'not ignored',
                'route': {
                    'action': 'replaceState',
                    'by': 'action'
                }
            }]
        ])('Should trigger a window.history\'s action.', function (
            action, url, data, eventInit, expectedArg) {

            var router = new Router();
            var route = jest.fn();

            router.route('id', url, route);
            router.change(action, url, data, eventInit);

            expect(route).toHaveBeenCalledWith(
                expect.any(Event),
                expectedArg
            );

        });

    });

    test.each([
        ['push', 'pushState'],
        ['replace', 'replaceState']
    ])('#%s() › Should do a %s.', function (methodName, action) {

        var router = new Router();
        var url = '/';
        var data = {};
        var eventInit = {
            'detail': {
                'custom': true
            }
        };
        var route = jest.fn();
        var id = 'some id';
        var expected = Object.assign({
            'data': data,
            'route': {
                'action': action,
                'by': 'action'
            }
        }, eventInit.detail);
        var spy = jest.spyOn(window.history, action);

        router.route(id, url, route, {
            'actions': [action]
        }); // jest.spyOn(router, 'change') is not allowed.

        router[methodName](url, data, eventInit);

        expect(spy).toHaveBeenCalledWith(
            null,
            '',
            url
        );
        expect(route).toHaveBeenCalledWith(
            expect.any(Event),
            expected
        );

        spy.mockRestore();

    });

    describe('History API fallback', function () {

        var pushStateFn = history.pushState;
        var replaceStateFn = history.replaceState;

        beforeEach(function () {

            delete History.prototype.pushState;
            delete History.prototype.replaceState;
            location.hash = '';

        });

        afterEach(function () {

            History.prototype.pushState = pushStateFn;
            History.prototype.replaceState = replaceStateFn;
            location.hash = '';

        });

        it('Should use location.hash and set a hashbang (#!).', function () {

            var url = '/';
            var result;

            result = Router.changeState('pushState', url);

            expect(result).toBe(true);
            expect(location.hash).toBe('#!' + url);

        });

        it('Should trigger a "popstate" event at the end of ' +
            'the event loop.', function (done) {

            var callsCount = 0;
            var router = new Router();
            var routeFn = jest.fn(function (e, detail) {

                var type = e.type;
                var route = detail.route;
                var action = route.action;

                callsCount++;

                if (callsCount === 1) {

                    expect(action).toBe('init');
                    expect(type).not.toBe('popstate');

                }
                else if (callsCount === 2) {

                    expect(action).toBe('pushState');
                    expect(type).not.toBe('popstate');

                }
                else if (callsCount === 3) {

                    expect(action).toBe('popstate');
                    expect(type).toBe('popstate');

                }
                else if (callsCount === 4) {

                    expect(action).toBe('popstate');
                    expect(type).toBe('popstate');

                    return void done();

                }

            });

            router.route('home', '/', routeFn);
            router.push('/popstate');
            history.back(), location.hash = ''; // history.back() didn't change the location.
            history.forward(), location.hash = '#!/popstate'; // history.forward() didn't change the location.

        });

    });

});
