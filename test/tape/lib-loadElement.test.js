var test = require('tape');
var loadElement = require('../../src/lib/loadElement');
var options = {'skip': typeof window === 'undefined'};

test('lib/loadElement.js', options, function (t) {

    var parseUrl = require('../../src/lib/parseUrl');
    var head = document.head;
    var assets = {
        'css': '/assets/loadElement-test.css',
        'js': '/assets/loadElement-test.js'
    };

    t.test('Should load files and set some default properties to ' +
		'the element.', function (st) {

        var link = loadElement('link', assets['css'], function (e) {

            st.is(this instanceof HTMLLinkElement, true);
            st.is(e instanceof Event, true);

            this.parentNode.removeChild(this);

            st.pass('The element finished loading.');

        }, function (loadedFile, url) {

            st.is(this instanceof HTMLLinkElement, true,
                '`this` is the current node.');

            st.is(
                loadedFile instanceof HTMLLinkElement
				|| loadedFile === null,
                true,
                '`loadedFile` is a node that loaded the same url.'
            );

            st.is(this.rel, 'stylesheet', 'Some link attributes ' +
					'were applied by default.');

            st.is(this.getAttribute('crossorigin'), null,
                'The url is not a cross origin resource, ' +
				'so the attribute was not added.');

            st.is(this.href, parseUrl(url).href,
                'The url was added to the src-like attribute.');

            if (loadedFile) {

                st.pass('The file was already added to the document.');

                return this;

            }

            head.appendChild(this);

            return this;

        });

        st.is(link instanceof Node, true,
            'The function returned the current Node.');

        st.end();

    });

    t.test('Should avoid to load the same file multiple times.', function (st) {

        st.plan(1);

        loadElement('link', assets['css'], function () {

            loadElement('link', this.src, null, function (wasLoaded) {

                if (wasLoaded) {

                    st.pass('The file was found and didn\'t ' +
					'get loaded.');

                }
                else {

                    st.fail('The file was already loaded.');

                }

            });

        }, function (isAlreadyLoaded, url) {

            if (isAlreadyLoaded) {

                st.pass('A script was found with the same '+
				'characteristics and didn\'t get loaded.');

                return this;

            }

            head.appendChild(this);

        });

    });

    t.test('Should use the default function to append the element ' +
		'if no function is given.', function (st) {

        var url = assets['js'];
        var scriptsWithTheSameUrl = document.querySelectorAll(
            'script[src="' + url + '"]'
        );

        if (scriptsWithTheSameUrl) {

            [].forEach.call(scriptsWithTheSameUrl, function (element) {

                element.parentNode.removeChild(element);

            });

        }

        return loadElement('script', url, function () {

            st.pass(this.parentNode, head,
                'The element was appended to the `head`');

            st.end();

        }, null);

    });

    t.test('Should be capable of extend the properties.', function (st) {

        st.plan(1);

        delete loadElement.nonSrcAttributes['a'];

        loadElement.nonSrcAttributes['a'] = 'href';

        loadElement('a', '#', null, function () {

            st.is(this instanceof HTMLAnchorElement, true,
                'The property was modified and it works ' +
			'as expected (even though "a" is not a "loadable" ' +
			'element).');

        });

    });

    t.test('Should set the "crossorigin" attribute to specific tags.', function (st) {

        var noop = function () {};

        st.plan(1);

        loadElement('img', '//:80', noop, function () {

            st.is(this.getAttribute('crossorigin'), 'anonymous');

        });

    });

    t.end();

});
