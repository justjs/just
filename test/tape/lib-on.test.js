var test = require('tape');
var on = require('../../src/lib/on');
var options = {'skip': typeof window === 'undefined'};

test('/lib/on', options, function (t) {

    var h = require('./helpers');
    var addEventListener = Element.prototype.addEventListener;
    var off = function (type, listener, options) {

        this.removeEventListener(type, listener, options);

    };

    t.test('Should query elements and add an event listener to each element.', {
        'timeout': 3000
    }, function (st) {

        var onClick = function () {};

        Element.prototype.addEventListener = addEventListener;
        h.spyOn(Element.prototype, 'addEventListener', function (type, listener, options) {

            st.is(this, document.body);
            st.is(type, 'click');
            st.is(listener, onClick);
            st.is(options, false, 'If no provided, useCapture will default to `false`');
            st.end();

        }, off);

        on('body', 'click', onClick);

    });

    t.test('Should set multiple events.', {'timeout': 3000}, function (st) {

        var onActive = function () {};
        var options = true;
        var eventTypes = ['focus', 'blur'];
        var selector = 'html, body';
        var expected = {
            'elements': [document.documentElement, document.body],
            'types': eventTypes,
            'listener': onActive,
            'options': options
        };

        st.plan(expected.elements.length * expected.types.length * 4);

        Element.prototype.addEventListener = addEventListener;
        h.spyOn(Element.prototype, 'addEventListener', function (type, listener, options) {

            st.is(h.findInArrayAndRemove(this, expected.elements), true);
            st.is(h.findInArrayAndRemove(type, expected.types), true);
            st.is(listener, expected.listener, 'Uses same listener for all.');
            st.is(options, expected.options, 'Uses same options for all.');

        }, off);

        on(selector, eventTypes, onActive, options);

    });

    t.test('Should add event listeners to any element.', {
        'timeout': 3000
    }, function (st) {

        var element = document.querySelector('body');

        Element.prototype.addEventListener = addEventListener;
        h.spyOn(Element.prototype, 'addEventListener', function () {

            st.is(this, element);
            st.end();

        }, off);

        on(element, 'click', function () {});

    });

    t.test('Should add event listeners to multiple elements.', {
        'timeout': 3000
    }, function (st) {

        var elements = document.getElementsByTagName('body');
        var expectedElements = [].slice.call(elements);

        st.plan(elements.length);

        Element.prototype.addEventListener = addEventListener;
        h.spyOn(Element.prototype, 'addEventListener', function () {

            st.is(h.findInArrayAndRemove(this, expectedElements), true);

        }, off);

        on(elements, 'click', function (e) {});

    });

    Element.prototype.addEventListener = addEventListener;
    t.end();

});
