var Define = require('@lib/Define');

beforeAll(function () {

    // Use in loaded files.
    window.Define = Define;

});

beforeEach(function () {

    Define.clean();

});

describe('@lib/Define.js', function () {

    /**
     * NOTE: Removing scripts might cause to load files twice, since
     * loadElement checks for urls in elements.
     */
    function removeScripts (selector) {

        [].forEach.call(document.querySelectorAll(selector),
            function (script) {

                script.parentNode.removeChild(script);

            });

    }

    it('Should throw (or not) if something is invalid.', function () {

        expect(function () {

            /* The id is needed. */
            Define(function () {});

        }).toThrow(TypeError);

        expect(function () {

            /* Non-string ids are invalid. */
            Define(false, [], function () {});

        }).toThrow(TypeError);

        expect(function () {

            /* Dependency ids must be valid ids. */
            Define('valid-id', 0, function () {});

        }).toThrow(TypeError);

        expect(function () {

            /* "/url" is considered an id, not a url. */
            Define.load('/url');

        }).toThrow(TypeError);

        expect(function () {

            var fn = jest.fn();

            Define('id', ['/url'], fn);

            /* Should never get called because "/url" was never defined. */
            expect(fn).not.toHaveBeenCalled();

        }).not.toThrow(TypeError);

        expect(function () {

            /* Only strings, arrays and object literals are allowed. */
            Define.load(null);

        }).toThrow(TypeError);

    }, 3000);

    it('Should call a module if no dependencies are given.', function (done) {

        Define('no-dependencies', done);

    }, 3000);

    it('Should load files when required.', function (done) {

        delete window.theGlobal;

        Define.addFiles({
            'theGlobal': '/assets/Define-test-global.js'
        });

        Define('required-now', [], function () {

            /** Module didn't load because it wasn't needed. */
            expect(window.theGlobal).not.toBeDefined();
            done();

        });

    }, 3000);

    it('Should return a global if the file doesn\'t contain a module definition' +
        'and no handler for the load event is given.', function (done) {

        removeScripts(
            'script[src="/assets/Define-test-global.js"]'
        );

        delete window.theGlobal;

        Define.addFiles({
            'theGlobal': '/assets/Define-test-global.js'
        });

        Define('load using default handler', ['theGlobal'], function (theGlobal) {

            expect(theGlobal).toBe(window.theGlobal);
            done();

        });

    });

    it('Should load files and execute them when the dependencies ' +
        'finished loading.', function (done) {

        removeScripts(
            'script[src="/assets/Define-test-global.js"], ' +
            'script[src="/assets/Define-test-local.js"]'
        );

        Define.addFiles({
            'theGlobal': '/assets/Define-test-global.js',
            'theLocal': '/assets/Define-test-local.js'
        }).addGlobals({
            'theGlobal': 'window.theGlobal'
        });

        Define('globals-and-locals', [
            'theGlobal',
            'theLocal'
        ], function (theGlobal, theLocal) {

            expect(theGlobal).toBe('global');
            expect(theGlobal).toBe(window.theGlobal);

            expect(theLocal).toBe('local');
            expect(window.theLocal).not.toBeDefined();

            done();

        });

    }, 3000);

    it('Should return a custom value.', function (done) {

        removeScripts(
            'script[src="/assets/Define-test-global.js"]'
        );

        delete window.theGlobal;
        delete window.theOtherGlobal;

        Define.addFiles({
            'theGlobal': '/assets/Define-test-global.js'
        }).load({

            'theGlobal': function (error, data) {

                expect(this).toBeInstanceOf(Element);
                expect(error).toBeNull();

                expect(data).toMatchObject({
                    'event': data.event,
                    'url': this.getAttribute('src'),
                    'id': 'theGlobal'
                });

                expect(data.event).toBeInstanceOf(Event);

                Define(data.id, window.theOtherGlobal = {});

            }

        });

        Define('modifying-the-value', ['theGlobal'], function (theGlobal) {

            expect(theGlobal).toBe(window.theOtherGlobal);

            done();

        });

    }, 3000);

    it('Should return any value (not only results from functions).', function (done) {

        removeScripts(
            'script[src="/assets/Define-test-not-a-function.js"]'
        );

        Define.addFiles({
            'not-a-function': '/assets/Define-test-not-a-function.js'
        });

        Define('caller', ['not-a-function'], function (notAFunction) {

            expect(notAFunction).toMatchObject({
                'an': 'object'
            });

            done();

        });

    }, 3000);

    it('Should call modules with recursive dependencies.', function (done) {

        removeScripts(
            'script[src="/assets/Define-test-recursive-a.js"], ' +
            'script[src="/assets/Define-test-recursive-b.js"]'
        );

        Define.addFiles({
            'recursive-a': '/assets/Define-test-recursive-a.js',
            'recursive-b': '/assets/Define-test-recursive-b.js'
        });

        Define('recursive', ['recursive-a', 'recursive-b'], function (a, b) {

            expect(a).toBe(b);
            done();

        });

    }, 3000);

    it('Should load anything (not just scripts).', function (done) {

        var url = '/assets/Define-test-non-script.css';
        var tagName = 'link';

        removeScripts('link[href="' + url + '"]');

        Define.addFiles({
            // Tag names are passed in the urls this way:
            'css': tagName + ' ' + url
        }).load({

            /*
             * Since this file does not contain any definitions,
             * you must intercept the load and define the id
             * by yourself.
             */
            'css': function (error, data) {

                Define(data.id);

            }
        });

        Define('load-any-file', ['css'], function (css) {

            expect(css).toBeUndefined();
            done();

        });

    }, 3000);

    it('Should load files passing only ids.', function (done) {

        removeScripts(
            'script[src="/assets/Define-test-multiple.js"]'
        );

        Define.addFiles({
            'multiple': '/assets/Define-test-multiple.js'
        });

        Define.load('multiple');
        // "object", "null" and "undefined" are defined in Define-test-multiple.js
        Define('load-string', ['object', 'null', 'undefined'], function () {

            done();

        });

    }, 3000);

    it('Should ignore invalid dependency ids.', function (done) {

        Define('null-id', null, function (value) {

            expect(value).not.toBeDefined();
            done();

        });

    });

    it('Should find file ids in document and load them.', function (done) {

        var element = document.createElement('div');

        removeScripts(
            'script[src="/assets/Define-test-main.js"]',
            'script[src="/assets/Define-test-multiple.js"]'
        );

        element.setAttribute('data-module-main', '/assets/Define-test-main.js');
        element.setAttribute('data-module-example', '/assets/Define-test-multiple.js');
        element.setAttribute('data-just-Define', JSON.stringify({
            'main': 'script [data-module-main]',
            'some modules': '[data-module-example]'
        }));

        document.body.appendChild(element);

        Define.init(); // This is called when Define loads.

        Define('on-load-main', 'index', function () {

            /**
             * "some modules" were registered, but only "main" loaded
             * and called everything from there.
             */
            done();

        });

    }, 5000);

});

afterAll(function () {

    delete window.Define;

});
