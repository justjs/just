var loadElement = require('@src/lib/loadElement');
var parseUrl = require('@src/lib/parseUrl');

describe('@src/lib/loadElement.js', function () {

    var head = document.head;
    var assets = {
        'css': '/assets/loadElement-test.css',
        'js': '/assets/loadElement-test.js'
    };

    it('Should load files and set some default properties to ' +
		'the element.', function () {

        var link = loadElement('link', assets['css'], function (e) {

            /** The element finished loading. */

            expect(this).toBeInstanceOf(HTMLLinkElement);
            expect(e).toBeInstanceOf(Event);

            this.parentNode.removeChild(this);

        }, function (loadedFile, url) {

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

            return this;

        });

        /** The function returned the current Node. */
        expect(link).toBeInstanceOf(Node);

    });

    it('Should avoid to load the same file multiple times.', function () {

        var pass = jest.fn(function () {

            expect(pass).toHaveBeenCalled();

        });
        var fail = jest.fn(function () {

            expect(fail).not.toHaveBeenCalled();

        });

        loadElement('link', assets['css'], function () {

            loadElement('link', this.src, null, function (wasLoaded) {

                if (wasLoaded) {

                    pass('The file was found and didn\'t ' +
					'get loaded.');

                }
                else {

                    fail('The file was already loaded.');

                }

            });

        }, function (isAlreadyLoaded, url) {

            if (isAlreadyLoaded) {

                pass('A script was found with the same '+
				'characteristics and didn\'t get loaded.');

                return this;

            }

            head.appendChild(this);

        });

    });

    it('Should use the default function to append the element ' +
		'if no function is given.', function () {

        var url = assets['js'];
        var scriptsWithTheSameUrl = document.querySelectorAll(
            'script[src="' + url + '"]'
        );

        if (scriptsWithTheSameUrl) {

            [].forEach.call(scriptsWithTheSameUrl, function (element) {

                element.parentNode.removeChild(element);

            });

        }

        loadElement('script', url, function () {

            /** The element was appended to the `head` */
            expect(this.parentNode).toBe(head);

        }, null);

    });

    it('Should be capable of extend the properties.', function () {

        delete loadElement.nonSrcAttributes['a'];

        loadElement.nonSrcAttributes['a'] = 'href';

        loadElement('a', '#', null, function () {

            /**
             * The property was modified and it works as expected
             * (even though "a" is not a "loadable" element).
             */
            expect(this).toBeInstanceOf(HTMLAnchorElement);

        });

    });

    it('Should set the "crossorigin" attribute to specific tags.', function () {

        var noop = function () {};

        loadElement('img', '//:80', noop, function () {

            expect(this.getAttribute('crossorigin')).toBe('anonymous');

        });

    });

});
