var on = require('@lib/on');
var helpers = require('@test/helpers');

describe('@lib/on', function () {

    var off = function (type, listener, options) {

        this.removeEventListener(type, listener, options);

    };

    it('Should query elements and add an event listener to each element.', function () {

        var onClick = function () {};
        var mock = jest.spyOn(Element.prototype, 'addEventListener').mockImplementation(function (
            type, listener, options) {

            expect(this).toBe(document.body);
            expect(type).toBe('click');
            expect(listener).toBe(onClick);
            /** If no provided, useCapture will default to `false` */
            expect(options).toBe(false);

            off.apply(this, Array.from(arguments));

        });

        on('body', 'click', onClick);
        expect(mock).toHaveBeenCalledTimes(1);
        mock.mockRestore();

    }, 3000);

    it('Should set multiple events.', function () {

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
        var mock = jest.spyOn(Element.prototype, 'addEventListener').mockImplementation(function (
            type, listener, options) {

            expect(helpers.findInArrayAndRemove(this, expected.elements)).toBe(true);
            expect(helpers.findInArrayAndRemove(type, expected.types)).toBe(true);
            /** Uses same listener for all. */
            expect(listener).toBe(expected.listener);
            /** Uses same options for all. */
            expect(options).toBe(expected.options);

            off.apply(this, Array.from(arguments));

        });

        on(selector, eventTypes, onActive, options);
        expect(mock).toHaveBeenCalledTimes(expected.elements.length * expected.types.length);
        mock.mockRestore();

    }, 3000);

    it('Should add event listeners to any element.', function () {

        var element = document.querySelector('body');
        var mock = jest.spyOn(Element.prototype, 'addEventListener').mockImplementation(function () {

            expect(this).toBe(element);

            off.apply(this, Array.from(arguments));

        });

        on(element, 'click', function () {});
        mock.mockRestore();

    }, 3000);

    it('Should add event listeners to multiple elements.', function () {

        var elements = document.getElementsByTagName('body');
        var expectedElements = [].slice.call(elements);
        var mock = jest.spyOn(Element.prototype, 'addEventListener').mockImplementation(function () {

            expect(helpers.findInArrayAndRemove(this, expectedElements)).toBe(true);

            off.apply(this, Array.from(arguments));

        });

        on(elements, 'click', function (e) {});
        mock.mockRestore();

    }, 3000);

});
