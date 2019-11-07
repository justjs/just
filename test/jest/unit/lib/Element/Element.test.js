var JElement = require('@lib/Element');

describe('@lib/Element.js', function () {

    describe('Element', function () {

        describe('namespaces', function () {

            var namespaces = JElement.namespaces;

            it('Should not be frozen.', function () {

                expect(Object.isFrozen(namespaces)).toBe(false);

            });

        });

        describe('build', function () {

            var build = JElement.build;

            it('Should build an Element.', function () {

                expect(build('div')).toBeInstanceOf(HTMLDivElement);

            });

            test.each([
                ['svg', JElement.namespaces.svg],
                ['http://www.w3.org/1999/xhtml:div', 'http://www.w3.org/1999/xhtml']
            ])('Should build an Element using %p within the %p namespace.', function (
                elementAsString, expectedNamespace) {

                var element = build(elementAsString);

                expect(element.namespaceURI).toBe(expectedNamespace);

            });

            it('Should build a Text Node.', function () {

                var text = build('>text');

                expect(text).toBeInstanceOf(Node);
                expect(text.nodeType).toBe(Node.TEXT_NODE);
                expect(text.nodeValue || text.textContent).toBe('text');

            });

            test.each([
                ['div>span', [HTMLSpanElement, HTMLDivElement]],
                ['div>div>span', [HTMLSpanElement, HTMLDivElement, HTMLDivElement]],
                ['span>>text', [Text, HTMLSpanElement], 'text'],
                ['div>>span>b', [Text, HTMLDivElement], 'span>b']
            ])('Should build a nested Node using %p.', function (nodeAsString, expectedInstances) {

                var node = build(nodeAsString);
                var parentNode;

                expectedInstances.forEach(function (expectedInstance) {

                    expect(parentNode || node).toBeInstanceOf(expectedInstance);
                    parentNode = node.parentNode;

                });

            });

            test.each([
                ['#id', 'id'],
                ['#id#id2', 'id2']
            ])('Should build an Element using %p, with %p as the id.', function (
                elementAsString, expectedID) {

                var element = build('div' + elementAsString);

                expect(element).toBeInstanceOf(HTMLDivElement);
                expect(element.id).toBe(expectedID);

            });

            test.each([
                ['.class', 'class'],
                ['.class.class2', 'class class2']
            ])('Should build an Element using %p, with %p as the class name.', function (
                elementAsString, expectedClassName) {

                var element = build('div' + elementAsString);

                expect(element).toBeInstanceOf(HTMLDivElement);
                expect(element.className).toBe(expectedClassName);

            });

            test.each([
                ['[hidden]', 'hidden', ''],
                ['[title="x"]', 'title', 'x'],
                ['[title=\'single quotes\']', 'title', 'single quotes'],
                ['[title=without quotes]', 'title', 'without quotes'],
                ['[title="x"][title="y"]', 'title', 'y']
            ])('Should build an Element using %p, with %p as attribute name and %p as attribute value.', function (
                elementAsString, attributeName, attributeValue) {

                var element = build('div' + elementAsString);

                expect(element).toBeInstanceOf(HTMLDivElement);
                expect(element.getAttribute(attributeName)).toBe(attributeValue);

            });

            test.each([
                [
                    [
                        'div.divClass#divID[data-attribute="div"]',
                        'span[data-attribute="span"]#spanID.spanClass',
                        '>Some text.'
                    ],
                    [
                        [
                            HTMLSpanElement,
                            'spanID',
                            'spanClass',
                            ['data-attribute', 'span']
                        ],
                        [
                            HTMLDivElement,
                            'divID',
                            'divClass',
                            ['data-attribute', 'div']
                        ]
                    ],
                    'Some text.'
                ]
            ])('Should build nested Elements with custom specifications.', function (
                elementsAsArray, children, text) {

                var element = build(elementsAsArray.join('>'));
                var currentElement = element;

                expect(element.nodeValue || element.textContent).toBe(text);

                children.forEach(function (child) {

                    var instance = child[0];
                    var id = child[1];
                    var className = child[2];
                    var attribute = child[3];
                    var attributeName = attribute[0];
                    var attributeValue = attribute[1];

                    currentElement = currentElement.parentNode;
                    expect(currentElement).toBeInstanceOf(instance);
                    expect(currentElement.id).toBe(id);
                    expect(currentElement.className).toBe(className);
                    expect(currentElement.getAttribute(attributeName)).toBe(attributeValue);

                });

            });

        });

    });

    describe('Element.prototype', function () {

        var JElementPrototype = JElement.prototype;

        describe('setAttributes', function () {

            var setAttributes = JElementPrototype.setAttributes;

            it('Should set multiple attributes to multiple elements.', function () {

                var elements = [
                    document.createElement('div'),
                    document.createElement('div')
                ];

                setAttributes.call(elements, {
                    'a': 'x',
                    'b': 'y'
                });

                elements.forEach(function (element) {

                    expect(element.getAttribute('a')).toBe('x');
                    expect(element.getAttribute('b')).toBe('y');

                });

            });

            test.each([
                // TODO: Use a non-deprecated attribute (xlink:href).
                ['xlink:href', JElement.namespaces['xlink']]
            ])('Should set attributes with namespaces URIs.', function (
                attributeName, namespace) {

                var attributes = {};
                var elementNS = document.createElementNS(
                    JElement.namespaces['svg'],
                    'use'
                );
                var spy = jest.spyOn(elementNS, 'setAttributeNS');

                attributes[attributeName] = 'whatever';
                setAttributes.call([elementNS], attributes);

                expect(spy).toHaveBeenCalled();

            });

        });

    });

});
