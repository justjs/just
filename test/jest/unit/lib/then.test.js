var then = require('@lib/then');

describe('@lib/then', function () {

    it('Should work as expected.', function (done) {

        var that = {};
        var args = [0, 1];
        var fn = then(function resolve () {

            expect(this).toBe(that);
            expect([].slice.call(arguments)).toMatchObject(args);
            throw 1;

        }, function reject (exception) {

            expect(this).toBe(that);
            expect(exception).toBe(1);
            done();

        });

        expect(fn).toBeInstanceOf(Function);

        fn.apply(that, args);

    });

    describe('Should call a function asynchronously.', function () {

        it('Should call a promise first, if possible.', function () {

            var spy = jest.spyOn(window.Promise.prototype, 'then');

            then(function () {})();

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();

        });

        it('Should call setImmediate second, if possible.', function () {

            var spy = window.setImmediate = jest.fn();
            var Promise = window.Promise;

            delete window.Promise;

            then(function () {})();

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
            window.Promise = Promise;

        });

        it('Should call requestAnimationFrame third, if possible.', function () {

            var spy = jest.spyOn(window, 'requestAnimationFrame');
            var Promise = window.Promise;
            var setImmediate = window.setImmediate;

            delete window.Promise;
            delete window.setImmediate;

            then(function () {})();

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
            window.Promise = Promise;
            window.setImmediate = setImmediate;

        });

        it('Should call setTimeout if no other alternative is available.', function () {

            var spy = jest.spyOn(window, 'setTimeout');
            var Promise = window.Promise;
            var setImmediate = window.setImmediate;
            var requestAnimationFrame = window.requestAnimationFrame;

            delete window.Promise;
            delete window.setImmediate;
            delete window.requestAnimationFrame;

            then(function () {})();

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
            window.Promise = Promise;
            window.setImmediate = setImmediate;
            window.requestAnimationFrame = requestAnimationFrame;

        });

    });

    describe('throttle()', function () {

        var throttle = then.throttle;

        it('Should work as expected.', function (done) {

            var that = {};
            var args = [0, 1];
            var fn = throttle(function resolve () {

                expect(this).toBe(that);
                expect([].slice.call(arguments)).toMatchObject(args);
                throw 1;

            }, function reject (exception) {

                expect(this).toBe(that);
                expect(exception).toBe(1);
                done();

            });

            expect(fn).toBeInstanceOf(Function);

            fn.apply(that, args);

        });

        it('Should limit the ammount of calls to a function.', function () {

            var spy = jest.fn(function () {

                expect(spy).toHaveBeenCalledTimes(1);
                expect.assertions(1);

            });

            for (var i = 0; i < 50; i++) { throttle(spy)(); }

        });

    });

});
