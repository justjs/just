var test = require('tape');
var Define = require('../../src/lib/Define');

// Use in loaded files.
window.Define = Define;

test('/lib/Define.js', function (t) {

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

    t.test('Should throw (or not) if something is invalid.', {
        'timeout': 3000
    }, function (st) {

        st.throws(function () {

            Define(function () {});

        }, TypeError, 'The id is needed.');

        st.throws(function () {

            Define(false, [], function () {});

        }, TypeError, 'Non-string ids are invalid.');

        st.throws(function () {

            Define('valid-id', 0, function () {});

        }, TypeError, 'Dependency ids must be valid ids.');

        st.throws(function () {

            Define.load('/url');

        }, TypeError, '"/url" is considered an id, not a url.');

        st.doesNotThrow(function () {

            Define('id', ['/url'], function () {

                st.fail();

            });

        }, TypeError, 'Should never get called because "/url" was never defined.');

        st.throws(function () {

            Define.load(null);

        }, TypeError, 'Only strings, arrays and object literals are allowed.');

        st.end();

    });

    t.doesNotThrow(function () {

        t.test('Should call a module if no dependencies are given.', {
            'timeout': 3000
        }, function (st) {

            Define('no-dependencies', function () {

                st.pass('The module got called.');
                st.end();

            });

        });

        t.test('Should load files when required.', {'timeout': 3000}, function (
            st) {

            delete window.theGlobal;

            Define.addFiles({
                'theGlobal': '/assets/Define-test-global.js'
            });

            Define('required-now', [], function () {

                st.is(typeof window.theGlobal, 'undefined');
                st.pass('Module didn\'t load because it wasn\'t needed.');

                st.end();

            });

        });

        t.test('Should load files and execute them when the dependencies ' +
            'finished loading.', {'timeout': 3000}, function (st) {

            removeScripts(
                'script[src="/assets/Define-test-global.js"], ' +
                'script[src="/assets/Define-test-local.js"]'
            );

            Define.clean();

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

                st.is(theGlobal, 'global');
                st.is(theGlobal, window.theGlobal);

                st.is(theLocal, 'local');
                st.is(typeof window.theLocal, 'undefined');

                st.pass('Dependencies finished loading.');

                st.end();

            });

        });

        t.test('Should return a custom value.', {'timeout': 3000}, function (st) {

            removeScripts(
                'script[src="/assets/Define-test-global.js"]'
            );

            delete window.theGlobal;
            delete window.theOtherGlobal;

            Define.clean();

            Define.addFiles({
                'theGlobal': '/assets/Define-test-global.js'
            }).load({

                'theGlobal': function (error, data) {

                    st.is(this instanceof Element, true);
                    st.is(error, null);

                    st.deepEquals(data, {
                        'event': data.event,
                        'url': this.getAttribute('src'),
                        'id': 'theGlobal'
                    });

                    st.is(data.event instanceof Event, true);

                    Define(data.id, window.theOtherGlobal = {});

                }

            });

            Define('modifying-the-value', ['theGlobal'], function (theGlobal) {

                st.is(theGlobal, window.theOtherGlobal);
                st.pass('Value has changed.');
                st.end();

            });

        });

        t.test('Should return any value (not only results from functions).', {
            'timeout': 3000
        }, function (st) {

            removeScripts(
                'script[src="/assets/Define-test-not-a-function.js"]'
            );

            Define.clean();

            Define.addFiles({
                'not-a-function': '/assets/Define-test-not-a-function.js'
            });

            Define('caller', ['not-a-function'], function (notAFunction) {

                st.deepEquals(notAFunction, {
                    'an': 'object'
                });

                st.end();

            });

        });

        t.test('Should call modules with recursive dependencies.', {
            'timeout': 3000
        }, function (st) {

            removeScripts(
                'script[src="/assets/Define-test-recursive-a.js"], ' +
            'script[src="/assets/Define-test-recursive-b.js"]'
            );

            Define.clean();

            Define.addFiles({
                'recursive-a': '/assets/Define-test-recursive-a.js',
                'recursive-b': '/assets/Define-test-recursive-b.js'
            });

            Define('recursive', ['recursive-a', 'recursive-b'], function (a, b) {

                st.is(a, b);

                st.pass('Dependencies finished loading.');

                st.end();

            });

        });

        t.test('Should load anything (not just scripts).', function (st) {

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

                st.is(css, void 0);
                st.end();

            });

        });

        t.test('Should load files passing only ids.', {'timeout': 3000}, function (
            st) {

            removeScripts(
                'script[src="/assets/Define-test-multiple.js"]'
            );

            Define.addFiles({
                'multiple': '/assets/Define-test-multiple.js'
            });

            Define.load('multiple');
            // "object", "null" and "undefined" are defined in Define-test-multiple.js
            Define('load-string', ['object', 'null', 'undefined'], function () {

                st.pass();
                st.end();

            });

        });

        t.test('Should ignore invalid dependency ids.', function (st) {

            Define('null-id', null, function (value) {

                st.is(typeof value, 'undefined');
                st.pass();
                st.end();

            });

        });

        t.test('Should find file ids in document and load them.', {
            'timeout': 5000
        }, function (st) {

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

                st.pass('"some modules" were registered, but only "main" loaded ' +
                'and called everything from there.');
                st.end();

            });

        });

    }, TypeError);

    t.end();

});

test.onFinish(function () {

    delete window.Define;

});
