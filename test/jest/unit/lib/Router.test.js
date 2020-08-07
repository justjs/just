var Router = require('@lib/Router');

describe('@lib/Router.js', function () {

    it('Should route once.', function () {

        var router = new Router();
        var routeA = jest.fn();
        var routeB = jest.fn();
        var routeC = jest.fn();
        var pathnameMock = jest
            .spyOn(window, 'location', 'get')
            .mockImplementation(function () { return {'pathname': '/'}; });

        router.route('a', '/', routeA);
        router.route('b', '/B', routeB);
        router.route('c', '/C', routeC);

        expect(routeA).toBeCalledTimes(1);
        expect(routeB).toBeCalledTimes(0);
        expect(routeC).toBeCalledTimes(0);

        pathnameMock.mockClear();

    });

});
