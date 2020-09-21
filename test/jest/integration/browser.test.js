/** @jest-environment jsdom */

var fs = require('fs');

function appendLibrary (src) {

    var text = fs.readFileSync(src);
    var script = document.createElement('script');

    script.id = src;
    script.innerHTML = text;
    document.head.appendChild(script);

}

function removeLibrary (id) {

    var script = document.getElementById(id);

    script.parentNode.removeChild(script);

}

test.each([
    ['dist/browser/core.js'],
    ['dist/browser/core.min.js'],
    ['dist/browser/just.js'],
    ['dist/browser/just.min.js']
])('%s should contain all the core members.', function (src) {

    expect(function () {

        appendLibrary(src);

        expect(window.just).toEqual(expect.objectContaining({
            'deprecate': expect.any(Function),
            'access': expect.any(Function),
            'prop': expect.any(Function),
            'check': expect.any(Function),
            'is': expect.any(Function),
            'ClassList': expect.any(Function),
            'defaults': expect.any(Function),
            'from': expect.any(Function),
            'Define': expect.any(Function),
            'Def': expect.any(Function),
            'defineProperties': expect.any(Function),
            'defProps': expect.any(Function),
            'defineProperty': expect.any(Function),
            'defProp': expect.any(Function),
            'eachProperty': expect.any(Function),
            'eachProp': expect.any(Function),
            'findElements': expect.any(Function),
            'el': expect.any(Function),
            'getRemoteParent': expect.any(Function),
            'parent': expect.any(Function),
            'isEmptyObject': expect.any(Function),
            'emptyObj': expect.any(Function),
            'isTouchSupported': expect.any(Function),
            'supportsTouch': expect.any(Function),
            'isWindow': expect.any(Function),
            'loadElement': expect.any(Function),
            'load': expect.any(Function),
            'LocalStorage': expect.any(Function),
            'addEventListener': expect.any(Function),
            'on': expect.any(Function),
            'removeEventListener': expect.any(Function),
            'off': expect.any(Function),
            'parseUrl': expect.any(Function),
            'stringToJSON': expect.any(Function),
            'toJSON': expect.any(Function),
            'toObjectLiteral': expect.any(Function),
            'toObj': expect.any(Function),
            'parseJSON': expect.any(Function),
            'createElement': expect.any(Function),
            'create': expect.any(Function),
            'request': expect.any(Function),
            'ajax': expect.any(Function)
        }));

        removeLibrary(src);

    }).not.toThrow();

});

test.each([
    ['dist/browser/just.js'],
    ['dist/browser/just.min.js']
])('%s should contain esential members.', function (src) {

    expect(function () {

        appendLibrary(src);

        expect(window.just).toEqual(expect.objectContaining({
            'Router': expect.any(Function)
        }));

        removeLibrary(src);

    }).not.toThrow();

});

describe('@dist/browser/polyfills-es5.min.js', function () {

    it('Should distribute minified polyfills apart.', function () {

        expect(fs.existsSync('./dist/browser/polyfills-es5.min.js')).toBe(true);

    });

});
