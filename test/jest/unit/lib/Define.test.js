var Define = require('@lib/Define');

describe.only('@lib/Define', function () {

    it('Should call a module.', function (done) {

        Define('module', [], function () { done(); });

    }, 3000);

    it('Should call a module with dependencies.', function (done) {

        Define('dependency', [], function () {});
        Define('moduleWithDependencies', ['dependency'],
            function () { done(); }
        );

    }, 3000);

    it('Should call the module with the returned values of the ' +
        'dependencies.', function (done) {


        Define('a', [], function () { return 'a'; });
        Define('b', [], function () { return 'b'; });
        Define('get-a-and-b', ['a', 'b'], function (a, b) {

            expect(a).toBe('a');
            expect(b).toBe('b');
            done();

        });

    });

    it('Should call a module with a circular dependency.', function (done) {

        var spy = jest.fn(function (someModule) {

            expect(spy).toHaveBeenCalledTimes(1);
            expect(someModule).toBe(this);
            done();

            return 1;

        });

        Define('someModule', ['someModule'], spy);

    });

    it('Should call recursive dependencies.', function (done) {

        var fn1 = jest.fn(function (r2) {

            expect(fn1).toHaveBeenCalledTimes(1);
            expect(r2).toBe(2);

            return 1;

        });
        var fn2 = jest.fn(function (r1) {

            expect(fn2).toHaveBeenCalledTimes(1);
            expect(r1).toBe(1);

            return 2;

        });

        Define('recursive-1', ['recursive-2'], fn1);
        Define('recursive-2', ['recursive-1'], fn2);
        expect.assertions(4);

    }, 3000);

});
