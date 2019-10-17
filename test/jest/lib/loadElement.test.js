var loadElement = require('@lib/loadElement');
var parseUrl = require('@lib/parseUrl');
var helpers = require('@test/helpers');

describe('@lib/loadElement.js', function () {

    var head = document.head;
    var assets = {
        'css': '/assets/loadElement-test.css',
        'js': '/assets/loadElement-test.js'
    };

    it('Should load files and set some default properties to ' +
		'the element.', function (done) {

        var onEvent = jest.fn(function (e) {

            /** The element finished loading. */

            expect(this).toBeInstanceOf(HTMLLinkElement);
            expect(e).toBeInstanceOf(Event);

            this.parentNode.removeChild(this);
            done();

        });
        var fn = jest.fn(function (loadedFile, url) {

            /** `this` is the current node. */
            expect(this).toBeInstanceOf(HTMLLinkElement);
            /** `loadedFile` is a node that loaded the same url. */
            expect(loadedFile).toBeNull();
            /** Some link attributes were applied by default. */
            expect(this.rel).toBe('stylesheet');
            /**
             * The url is not a cross origin resource,
             * so the attribute was not added.
             */
            expect(this.getAttribute('crossorigin')).toBeNull();
            /** The url was added to the src-like attribute. */
            expect(this.href).toBe(parseUrl(url).href);

            head.appendChild(this);

            return this;

        });
        var link = loadElement('link', assets['css'], onEvent, fn);

        expect(fn).toHaveBeenCalledTimes(1);
        /** The function returned the current Node. */
        expect(fn).toHaveReturnedWith(link);
        expect(link).toBeInstanceOf(Node);

    });

    it('Should avoid loading the same file multiple times.', function (done) {

        var url = assets['css'];

        helpers.removeElements('link[href="' + url + '"]');

        loadElement('link', url, function () {

            loadElement('link', url, null, function (wasLoaded) {

                if (wasLoaded) {

                    /** The file was found and didn't get loaded. */
                    done();

                }
                else {

                    done(new Error('The file was already loaded.'));

                }

            });

        }, function (loadedElement) {

            expect(loadedElement).toBeNull();
            head.appendChild(this);

        });

    });

    it('Should use the default function to append the element ' +
		'if no function is given.', function (done) {

        var url = assets['js'];

        helpers.removeElements(
            'script[src="' + url + '"]'
        );

        loadElement('script', url, function () {

            /** The element was appended to the `head` */
            expect(this.parentNode).toBe(head);
            done();

        }, null);

    });

    it('Should be capable of extending the properties.', function (done) {

        delete loadElement.nonSrcAttributes['a'];

        loadElement.nonSrcAttributes['a'] = 'href';

        loadElement('a', '#', null, function () {

            /**
             * The property was modified and it works as expected
             * (even though "a" is not a "loadable" element).
             */
            expect(this).toBeInstanceOf(HTMLAnchorElement);
            done();

        });

    });

    it('Should set the "crossorigin" attribute to specific tags.', function (done) {

        var noop = function () {};

        loadElement('img', '//:80', noop, function () {

            expect(this.getAttribute('crossorigin')).toBe('anonymous');
            done();

        });

    });

});
