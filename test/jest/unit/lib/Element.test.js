var Element = require('@lib/Element');

describe('@lib/Element.js', function () {

    describe('Element', function () {

        describe('createElement', function () {

            var createElement = Element.createElement;

            it('Should create an Element.', function () {

                expect(createElement('div')).toBeInstanceOf(HTMLDivElement);

            });

            test.each([
                ['svg', Element.NAMESPACES.svg],
                ['http://www.w3.org/1999/xhtml:div', 'http://www.w3.org/1999/xhtml']
            ])('Should create an Element within a namespace.', function (
                elementAsString, expectedNamespace) {

                var element = createElement(elementAsString);

                expect(element.namespaceURI).toBe(expectedNamespace);

            });

            it('Should create a Text Node.', function () {

                var text = createElement('>text');

                expect(text).toBeInstanceOf(Node);
                expect(text.nodeType).toBe(Node.TEXT_NODE);
                expect(text.nodeValue || text.textContent).toBe('text');

            });

            test.each([
                ['div>span', [HTMLSpanElement, HTMLDivElement]],
                ['div>div>span', [HTMLDivElement, HTMLDivElement, HTMLSpanElement]],
                ['span>>text', [Text, HTMLSpanElement], 'text'],
                ['div>>span>b', [Text, HTMLSpanElement, HTMLDivElement], 'span>b']
            ])('Should create a nested Node.', function (nodeAsString, expectedInstances) {

                var node = createElement(nodeAsString);
                var parentNode;

                expectedInstances.forEach(function (expectedInstance) {

                    expect(parentNode || node).toBeInstanceOf(expectedInstance);
                    parentNode = node.parentNode;

                });

            });

            test.each([
                ['#id', 'id'],
                ['#id#id2', 'id2']
            ])('Should create an Element with %s as the id.', function (
                elementAsString, expectedID) {

                var element = createElement('div' + elementAsString);

                expect(element).toBeInstanceOf(HTMLDivElement);
                expect(element.id).toBe(expectedID);

            });

            test.each([
                ['.class', 'class'],
                ['.class.class2', 'class class2']
            ])('Should create an Element with %s as the class name.', function (
                elementAsString, expectedClassName) {

                var element = createElement('div' + elementAsString);

                expect(element).toBeInstanceOf(HTMLDivElement);
                expect(element.className).toBe(expectedClassName);

            });

            test.each([
                ['[hidden]', 'hidden', ''],
                ['[title="x"]', 'title', 'x'],
                ['[title=\'single quotes\']', 'title', 'single quotes'],
                ['[title=without quotes]', 'title', 'without quotes'],
                ['[title="x"][title="y"]', 'title', 'y']
            ])('Should create %s with %s as attribute name and %s as attribute value.', function (
                elementAsString, attributeName, attributeValue) {

                var element = createElement('div' + elementAsString);

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
                            HTMLDivElement,
                            'divID',
                            'divClass',
                            ['data-attribute', 'div']
                        ],
                        [
                            HTMLSpanElement,
                            'spanID',
                            'spanClass',
                            ['data-attribute', 'span']
                        ]
                    ],
                    'Some text.'
                ]
            ])('Should create nested Elements with custom specifications.', function (
                elementsAsArray, children, text) {

                var element = createElement(elementsAsArray.join('>'));

                expect(element.nodeValue || element.textContent).toBe(text);

                children.forEach(function (child) {

                    var instance = child[0];
                    var id = child[1];
                    var className = child[2];
                    var attribute = child[3];
                    var attributeName = attribute[0];
                    var attributeValue = attribute[1];

                    expect(child).toBeInstanceOf(instance);
                    expect(child.id).toBe(id);
                    expect(child.className).toBe(className);
                    expect(child.getAttribute(attributeName)).toBe(attributeValue);

                });

            });

        });

    });

});
