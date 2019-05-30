var test = require('tap').test,
	loadElement = require('../../src/lib/loadElement'),
	getElements = require('../../src/lib/getElements'),
	parseUrl = require('../../src/lib/parseUrl');

var head = document.getElementsByTagName('head')[0];

test('lib/loadElement.js', {'autoend': true}, function (t) {

	t.test('Should load files and set some default properties to ' +
		'the element.', function (st) {

		var handler = function (loadedFile, url) {

			var isCrossOrigin = parseUrl(url).origin !== window.location.origin;

			st.true(this instanceof HTMLLinkElement,
				'`this` is the current node.');

			st.true(loadedFile instanceof HTMLLinkElement ||
				loadedFile === null, '`loadedFile` is a node that ' +
				'loaded the same url.');
		
			st.is(this.rel, 'stylesheet', 'Some link attributes ' +
					'were applied by default.');

			st.is(this.getAttribute('crossorigin'), null,
				'The url is not a cross origin resource, ' +
				'so the attribute was not added.');

			st.is(this.href, window.location.origin + url,
				'The url was added to the src-like attribute.');

			if (loadedFile) {
				st.pass('The file was already added to the document.');
				return this;
			}

			this.onload = function () {
				this.parentNode.removeChild(this);
				st.pass('The element finished loading.');
			};

			this.onerror = function (error) {
				st.fail(error);
			};

			head.appendChild(this);

			return this;

		};
		var link = loadElement('link', '/load-test.css', handler);

		st.plan(7);

		st.true(link instanceof Node, 'The function returned the ' +
			'current Node.');

	});

	t.test('Should avoid to load the same file multiple times.',
		function (st) {
		
		st.plan(1);

		loadElement('link', '/load-test.css', function (
			isAlreadyLoaded, url) {
			
			if (isAlreadyLoaded) {
				st.pass('A script was found with the same '+
					'characteristics and didn\'t get loaded.');
				return this;
			}

			this.onload = function () {

				loadElement('link', url, function (wasLoaded) {
					
					if (wasLoaded) {
						st.pass('The file was found and didn\'t ' +
							'get loaded.');
					}
					else {
						st.fail('The file was already loaded.');
					}

				});

			};

			this.onerror = function (error) {
				st.fail(error);
			};

			head.appendChild(this);

		});

	});

	t.test('Should append the element to the head if no function ' +
		'is given.', function (st) {

		var script = (function (url) {

			var scriptsWithTheSameUrl = getElements(
				'script[src="' + url + '"]'
			);

			if (scriptsWithTheSameUrl) {
				scriptsWithTheSameUrl.forEach(function (element) {
					element.parentNode.removeChild(element);
				});
			}

			return loadElement('script', url);

		})('/load-test.js');
		console.log(script.parentNode);
		st.is(script.parentNode, head, 'The element gets added ' +
			'by default to the `head` of the document.');

		st.end();

	});

	t.test('Should be capable of extend the properties.',
		function (st) {

		loadElement.NON_SRC_ATTRIBUTES['object'] = 'data';
		
		st.is(loadElement('object', '/load-test.swf').tagName,
			'OBJECT', 'The property was modified and it works ' +
			'as expected.');
		st.end();

	});

});