var test = require('tape'),
	loadElement = require('../../src/lib/loadElement');

var parseUrl = require('../../src/lib/parseUrl').parseUrl,
	head = document.getElementsByTagName('head')[0];

test('lib/loadElement.js', function (t) {

	t.test('should load files and set some default properties to the element', function (st) {

		var handler = function (loadedFile) {

			var isCrossOrigin = parseUrl(url).origin !== window.location.origin;

			st.false(loadedFile);
			st.is(this instanceof Element);
			st.is(typeof loadedFile, 'boolean');
			st.is(this.href, window.location.origin + url);

			if (this.tagName === 'LINK') {
				st.is(this.rel, 'stylesheet');
			}
			else if (isCrossOrigin && /^(script|img)$/i.test(this.tagName)) {
				st.is(this.getAttribute('crossorigin'), 'anonymous');
			}

			if (loadedFile) {
				st.fail('The file was already loaded');
			}

			this.onload = function () {
				this.parentNode.removeChild(this);
				st.pass();
			};

			this.onerror = function (error) {
				st.fail(error);
			};

		};
		var link = loadElement('link', '/load-test.css', handler);
		var script = loadElement('script', '/load-test.js', handler);

		st.true(link instanceof Element);
		st.true(script instanceof Element);

		st.end();

	});

	t.test('should avoid to load the same file multiple times', function (st) {
		
		var url = '/load-test.css';

		loadElement('link', url, function (isAlreadyLoaded) {
			
			if (isAlreadyLoaded) {
				st.pass();
				return this
			}

			this.onload = function () {

				loadElement('link', url, function (wasLoaded) {
					
					if (wasLoaded) {
						st.pass();
					}
					else {
						st.fail('The file was already loaded');
					}

				});

			};

			this.onerror = function (error) {
				st.fail(error);
			};

		});

	});

	t.test('should append the element to the head if no function is given', function (st) {

		var script = loadElement('script', '/load-test.js');

		st.is(script.parentNode, head);
		st.end();

	});

	t.test('should be capable of extend the properties', function (st) {

		loadElement.NON_SRC_ATTRIBUTES['object'] = 'data';
		
		st.is(loadElement('object', '/load-test.swf').tagName, 'OBJECT');
		st.end();

	});

});