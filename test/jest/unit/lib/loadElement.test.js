var loadElement = require('@lib/loadElement');
var helpers = require('@test/helpers');
var removeElements = helpers.removeElements;

describe('@lib/loadElement.js', function () {

    var assets = {
        'link': '//:0',
        'script': '//:0',
        'iframe': '//:0',
        'embed': '//:0',
        'img': '//:0',
        'video': '//:0'
    };

    beforeEach(function () {

        removeElements.apply(null, Object.keys(assets));

    });

    it('Should create an element, append it to document.head and ' +
        'return it.', function () {

        var script = loadElement('script');

        expect(script).toBeInstanceOf(HTMLScriptElement);
        expect(script.parentNode).toBe(document.head);

    });

    test.each([
        ['script', 'src'],
        ['link', 'href'],
        ['iframe', 'src'],
        ['embed', 'src'],
        ['img', 'src'],
        ['video', 'src']
    ], 'Should load <%s>s setting the 2nd argument as a string.', function (tagName, urlAttribute) {

        var url = assets[tagName];
        var element = loadElement(tagName, url);
        var attribute = element.getAttribute(urlAttribute);

        expect(attribute).toBe(url);

    });

    it('Should set properties on the created element.', function () {

        var tagName = 'link';
        var url = assets['link'];
        var properties = {'href': url};
        var element = loadElement(tagName, properties);

        expect(element.href).toBe(url);

    });

    it('Should not load the same url multiple times.', function () {

        var url = assets['link'];
        var selector = 'link[href="' + url + '"]';

        expect(document.querySelectorAll(selector).length).toBe(0);

        loadElement('link', url);
        loadElement('link', {'href': url});

        expect(document.querySelectorAll(selector).length).toBe(1);

    });

    it('Should set a custom container.', function () {

        var tagName = 'script';
        var listener = null;
        var container = document.body;

        loadElement(tagName, listener, container);

    });

    test.each([
        ['set', 'script', '//:0'],
        ['set', 'img', '//:0'],
        ['set', 'link', '//:0'],
        ['set', 'video', '//:0'],
        ['not set', 'iframe', '//:0'],
        ['not set', 'embed', '//:0'],
        ['not set', 'script', '/assets/loadElement-test.js']
    ], 'Should %s "crossOrigin" property to "anonymous" on <%s>s.', function (action, tagName, url) {

        var element = loadElement(tagName, url);

        if (action === 'set') { expect(element.crossOrigin).toBe('anonymous'); }
        else { expect(element.crossOrigin).not.toBe('anonymous'); }

    });

});
