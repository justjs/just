var View = require('@lib/View.js');

describe.only('@lib/View.js', function () {

    describe('.init()', function () {

        function buildMarkup (options) {

            var opts = Object.assign({
                'id': null,
                'attributeName': View.INIT_ATTRIBUTE_NAME,
                'container': document.body,
                'viewOptions': {
                    'id': 'template',
                    'attributes': 'data-x'
                },
                'listeners': null
            }, options);
            var attributeName = opts.attributeName;
            var container = opts.container;
            var constructorOptions = opts.viewOptions;
            var listeners = opts.listeners;
            var constructorOptionsString = (typeof constructorOptions === 'string'
                ? constructorOptions
                : JSON.stringify(constructorOptions)
            );
            var id = opts.id || constructorOptions.id;

            container.innerHTML = [
                '<span id="' + id + '"',
                listeners ? constructorOptions.attributes + '-on=\'' + JSON.stringify(listeners) + '\'' : '',
                attributeName + '=\'' + constructorOptionsString + '\'>',
                '</span>'
            ].join(' ');

            return opts;

        }

        it('Should search elements with the [' + View.INIT_ATTRIBUTE_NAME + '] attribute ' +
            'parse each of them as JSON, ' +
            'call the #constructor with those options, ' +
            'and store the view in the element that contains it.', function () {

            var options = buildMarkup();
            var constructorOptions = options.viewOptions;
            var element = document.getElementById(constructorOptions.id);
            var result = View.init();

            expect(result).toMatchObject([
                new View(constructorOptions)
            ]);
            expect(element).toHaveProperty('view');

        });

        it('Should attach listeners.', function () {

            var options = buildMarkup({
                'listeners': {
                    'customupdate': 'doSomething'
                }
            });
            var fn = jest.fn();
            var element = document.getElementById(options.viewOptions.id);
            var event = new CustomEvent('customupdate');

            View.init({
                'listeners': {
                    'doSomething': function (e) { fn(this, e); }
                }
            });

            element.dispatchEvent(event);

            expect(fn).toHaveBeenCalledWith(element, event);

            // @TODO Remove listener.

        });

        it('Should replace nested vars using View.globals ' +
            'and options.listeners data.', function () {

            var options = buildMarkup({
                'id': 'some-id',
                /**
                 * ${this} should be supported.
                 * Nested replacements are supported.
                 * Keys and values are supported, even inside other structures (arrays, objects, ...).
                 */
                'viewOptions': '{"id": "${this.id}", "data": {"${g.getKey()}": ["${g.getValue()}", ${notAListener}]}}'
            });
            var listeners = {
                'notAListener': ['nope']
            };
            var globals = {
                'g': {
                    'getKey': function () { return 'key'; },
                    'getValue': function () { return 'value'; }
                }
            };
            var result;

            Object.assign(View.globals, globals);

            result = View.init({
                'listeners': listeners
            });

            expect(result).toMatchObject([
                new View({
                    'id': options.id,
                    'data': {
                        'key': ['value', ['nope']]
                    }
                })
            ]);

            delete View.globals.g;

        });

    });

    describe('#constructor()', function () {

        var defaultProperties = {
            'id': null,
            'element': null,
            'data': {},
            'attributes': {
                'var': 'data-var',
                'html': 'data-var-html',
                'attr': 'data-var-attr',
                'if': 'data-var-if',
                'alias': 'data-var-as'
            },
            'previousData': null
            /**
             * We don't set 'original' here because it's expected
             * to be a copy of this object.
             */
            // 'original': {}
        };

        it('Should set default properties.', function () {

            var view = new View();

            expect(view.id).toBe(defaultProperties.id);
            expect(view.element).toBe(defaultProperties.element);
            expect(view.data).toMatchObject(defaultProperties.data);
            expect(view.attributes).toMatchObject(defaultProperties.attributes);
            expect(view.previousData).toBe(defaultProperties.previousData);

        });

        it('Should set the #original property with a copy of its ' +
			'current properties.', function () {

            var view = new View();
            var defaultPropertyOriginal = Object.assign({},
                defaultProperties
            );

            expect(view.original).not.toBeInstanceOf(View);
            expect(view.original).toMatchObject(defaultPropertyOriginal);

        });

    });

    describe('#insert', function () {

        var container = document.body;
        var relativeElement = Object.assign(document.createElement('span'), {
            'id': 'some-id'
        });

        beforeEach(function () {

            // Create a dumb element to compare it with this later.
            container.appendChild(relativeElement);

        });

        afterEach(function () {

            document.body.innerHTML = '';

        });

        test.each([
            ['before', '"before" is valid.'],
            [{'before': container.firstChild}, '{"before": Node} is valid.'],
            ['other', 'other values will use appendChild instead'],
        ])('Should not throw if the given position is invalid (%s)', function (position) {

            var view = new View({
                'element': document.createElement('span')
            });

            expect(function () { view.insert(position, container); }).not.toThrow(TypeError);

        });

        test.each([
            ['before the first element.', 'before', 0],
            ['after the last element.', 'after', 1],
            ['before the given Node.', {'before': relativeElement}, 0]
        ])('Should insert #element %s.', function ($0, position,
            expectedPositionIndex) {

            var element = document.createElement('span');
            var view = new View({
                'element': element
            });
            var children;

            view.insert(position, container);

            children = container.children;

            expect(children[expectedPositionIndex]).toBe(element);

        });

        test.each([
            ['the template', {'id': relativeElement.id}],
            ['the element', {'element': relativeElement}],
            ['the template or the element', {'id': relativeElement.id, 'element': relativeElement}]
        ])('Should use %s\'s parentNode, if the container was not provided.', function (_, options) {

            var view = new View(options);

            expect(function () { view.insert('before'); }).not.toThrow();
            expect(container.firstChild).toBe(relativeElement);

        });

    });

    describe('.globals', function () {

        it('Should be mutable.', function () {

            View.globals.mutable = true;

            expect(View.globals.mutable).toBe(true);
            expect(delete View.globals.mutable).toBe(true);

        });

    });

    describe('.resolveConditional()', function () {

        it('Should return undefined if no arguments were given.', function () {

            var result = View.resolveConditional();

            expect(result).toBe(void 0);

        });

        it('Should return true if "true" is given.', function () {

            var result = View.resolveConditional('true');

            expect(result).toBe(true);

        });

        test.each([

            // Present with a truthy value:
            ['a', {'a': 1}, 1],
            // Present with a falsy value:
            ['b', {'b': ''}, ''],
            // Not present:
            ['a', null, void 0],

            // A nested property (with a truthy value):
            ['c.d', {'c': {'d': true}}, true],
            // Not a nested property:
            ['c.d', {'c.d': true}, void 0]

        ])('Should check if "%s" is a truthy value within the given ' +
			'object.', function (property, object, expected) {

            var result = View.resolveConditional(property, object);

            expect(result).toBe(expected);

        });

        test.each([

            // Negated true:
            ['true', {}, false],

            // Negated truthy value:
            ['a', {'a': true}, false],
            // Negated falsy value:
            ['a', {'a': false}, true],

            // Negated not present value:
            ['a', null, true],
            // Negated nested truthy value:
            ['a.b.c', {'a': {'b': {'c': true}}}, false],
            // Negated nested falsy value:
            ['a.b.c', {'a': {'b': {'c': false}}}, true]

        ])('Should negate "%s" by prepending "!"', function (
            conditional, data, expected) {

            var result = View.resolveConditional('!' + conditional, data);

            expect(result).toBe(expected);

        });

    });

    describe('.resolveConditionals()', function () {

        it('Should resolve many conditionals and return the first ' +
            'truthy value.', function () {

            var result = View.resolveConditionals({
                'a': 'do this',
                'b': 'or this'
            }, {'a': true});

            expect(result).toBe('do this');

        });

        it('Should allow passing strings to resolve one conditional ' +
            'an return its truthy value', function () {

            var result = View.resolveConditionals('a', {'a': 1});

            expect(result).toBe(1);

        });

        it('Should resolve conditionals once, when strings are given.', function () {

            var fn = jest.fn();
            var result = View.resolveConditional('fn()', {'fn': fn});

            expect(fn).toHaveBeenCalledTimes(1);

        });

    });

    describe('.replaceVars()', function () {

        it('Should not replace anything.', function () {

            var text = 'hey!';
            var expected = text;
            var result = View.replaceVars(text);

            expect(result).toBe(expected);

        });

        it('Should replace a ${splitted.property} with its accessed ' +
            'value.', function () {

            var result = View.replaceVars('{${splitted.property}}!', {
                'splitted': {'property': 'hey'}
            });

            expect(result).toBe('{hey}!');

        });

        it('Should replace undefined values with a default value.', function () {

            var text = 'Replace ${me}';
            var defaultValue = 'who?';
            var expected = 'Replace who?';
            var result = View.replaceVars(text, null, defaultValue);

            expect(result).toBe(expected);

        });

        it('Should .resolveConditionals() first, if an object is given, ' +
            'and replace ${placeholders} within the accessed value.', function () {

            // @TODO Mock View.resolveConditionals(), if possible.
            var result = View.replaceVars({
                'a': 'Show ${a}',
                'b': 'Show ${b}'
            }, {'b': 'me (b)'});

            expect(result).toBe('Show me (b)');

        });

        it('Should not replace undefined values.', function () {

            var result = View.replaceVars('Don\'t replace ${me}!');

            expect(result).toBe('Don\'t replace ${me}!');

        });

        it('Should call a function within a placeholder and replace ' +
            'the placeholder with its returned value.', function () {

            var result = View.replaceVars('${say.hi()}', {
                'say': {
                    'hi': function () { return 'hi!'; }
                }
            });

            expect(result).toBe('hi!');

        });

        it('Should replace a function and call it with primitive ' +
            'arguments.', function () {

            var fn = jest.fn(function () { return 'done'; });
            var result = View.replaceVars('Test: ${test(undefined, "", 0, false, null, {}, [])}!', {
                'test': fn
            });

            expect(result).toBe('Test: done!');
            expect(fn).toHaveBeenCalledWith(void 0, '', 0, false, null, {}, []);

        });

        it('Should replace a function and call it with vars as ' +
            'arguments.', function () {

            var fn = jest.fn(function () {

                var args = [].slice.call(arguments);

                return args.reduce(function toString (string, arg) {

                    return (string += arg + ', ');

                }, '');

            });
            var result = View.replaceVars('${fn(undefinedVar, empty, zero, falseVar, nullVar, object-literal, array)}', {
                'undefinedVar': undefined,
                'empty': '',
                'zero': 0,
                'falseVar': false,
                'nullVar': null,
                'object-literal': {'a': 'b'},
                'array': [1],
                'fn': fn
            });

            expect(fn).toHaveBeenCalledWith(void 0, '', 0, false, null, {'a': 'b'}, [1]);
            expect(result).toBe('undefined, , 0, false, null, [object Object], 1, ');

        });

        it('Should replace a function with nested arguments.', function () {

            var result = View.replaceVars('${fn(a.b.c)}', {
                'a': {'b': {'c': 'hey!'}},
                'fn': function (x) { return x; }
            });

            expect(result).toBe('hey!');

        });

        it('Should replace nested functions.', function () {

            var data = {
                'a': {
                    'b': jest.fn(function () { return {'f': 'f'}; })
                },
                'c': {
                    'd': jest.fn(function () { return {'e': 'e'}; })
                },
                'e': 1
            };
            var result = View.replaceVars('${a.b(c.d().e, e).f}', data);

            expect(data.a.b).toHaveBeenCalledTimes(1);
            expect(data.c.d).toHaveBeenCalledTimes(1);
            expect(result).toBe(data.a.b(data.c.d().e, data.e).f);

        });

        test.each([
            [[1, 2]],
            [{'a': 'b', 'c': 'd'}],
            [[{'a': [1, {'b': {'c': undefined}}, null]}]],
            [[1.1, .1]]
        ])('Should pass complex arguments to functions (%s).', function (arg) {

            var fn = jest.fn();
            var data = {'fn': fn};
            var placeholder = '${fn(' + JSON.stringify(arg) + ')}';
            var result = View.replaceVars(placeholder, data);

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenNthCalledWith(1, arg);
            expect(result).toBe(placeholder);

        });

    });

    describe('.updateVars()', function () {

        it('Should return false if text was NOT updated.', function () {

            var element = document.body;
            var data = {};
            var attributeName = 'data-something';
            var textContentMock = jest
                .spyOn(element, 'textContent', 'set')
                .mockImplementation(function () {});
            var result;

            element.removeAttribute(attributeName);

            result = View.updateVars(element, data, attributeName);

            expect(result).toBe(false);
            expect(textContentMock).not.toHaveBeenCalled();

            textContentMock.mockRestore();

        });

        it('Should return true if text was updated.', function () {

            var element = document.body;
            var data = {'x': 1};
            var attributeName = 'data-something';
            var attributeValue = '${x}';
            var textContentMock;
            var result;

            element.setAttribute(attributeName, attributeValue);
            textContentMock = jest
                .spyOn(element, 'textContent', 'set')
                .mockImplementation(function () {});

            result = View.updateVars(element, data, attributeName);

            expect(result).toBe(true);

            element.removeAttribute(attributeName);
            textContentMock.mockRestore();

        });

        it('Should NOT replace an element\'s text if the given ' +
            'attribute is a constant.', function () {

            var element = document.body;
            var attributeName = 'data-var';
            var data = {};
            var attributeValue = 'some constant';
            var textContentSpy;

            element.setAttribute(attributeName, attributeValue);

            textContentSpy = jest.spyOn(element, 'textContent', 'set');
            View.updateVars(element, data, attributeName);

            expect(textContentSpy).not.toHaveBeenCalled();

            element.removeAttribute(attributeName);

        });

        it('Should replace an element\'s text if the given ' +
            'attribute is variable.', function () {

            var element = document.body;
            var attributeName = 'data-var';
            var data = {'x': 1};
            var attributeValue = '${x}';
            var textContentMock;

            element.setAttribute(attributeName, attributeValue);
            textContentMock = jest
                .spyOn(element, 'textContent', 'set')
                .mockImplementation(function () {});

            View.updateVars(element, data, attributeName);

            expect(textContentMock).toHaveBeenCalled();

            element.removeAttribute(attributeName);
            textContentMock.mockRestore();

        });

        it('Should allow passing any function as a setter.', function () {

            var element = document.body;
            var data = {'x': 1};
            var attributeName = 'data-var';
            var attributeValue = '${x}';
            // var expectedText = data.x;
            var setter = function () {};
            var result;

            element.setAttribute(attributeName, attributeValue);

            result = View.updateVars(element, data, attributeName, setter);

            /*
             * expect(setter).toHaveBeenCalledWith(element, expectedText);
             * expect(setter).toHaveReturned(void 0);
             */
            expect(result).toBe(false);

            element.removeAttribute(attributeName);

        });

        it('Should replace "this" with the current element.', function () {

            var element = document.body;
            var data = {'fn': jest.fn()};
            var attributeName = 'data-var';
            var attributeValue = '${fn(this)}';

            element.setAttribute(attributeName, attributeValue);

            View.updateVars(element, data, attributeName);

            expect(data.fn).toHaveBeenCalledWith(element);

            element.removeAttribute(attributeName);

        });

    });

    describe('.updateHtmlVars()', function () {

        it('Should replace html contents.', function () {

            var element = document.body;
            var data = {'x': '<span></span>'};
            var attributeName = 'data-var';
            var attributeValue = '${x}';
            var expectedText = data.x;
            var innerHTMLSpy = jest.spyOn(element, 'innerHTML', 'set');
            var result;

            element.setAttribute(attributeName, attributeValue);

            result = View.updateHtmlVars(element, data, attributeName);

            expect(innerHTMLSpy).toHaveBeenCalledWith(expectedText);
            expect(result).toBe(true);

            innerHTMLSpy.mockRestore();

        });

    });

    describe('.updateConditionals()', function () {

        var element = document.body;
        var data = {'presentKey': 'value'};
        var attributeName = 'data-var-if';
        var hiddenAttribute = 'hidden';

        it('Should hide an element (by setting the [hidden] attribute) ' +
            'if the conditional returns false.', function () {

            var attributeValue = 'notPresentKey';
            var resolved = false;
            var hidden = true;
            var result;

            element.removeAttribute(hiddenAttribute);
            element.setAttribute(attributeName, attributeValue);

            result = View.updateConditionals(element, data, attributeName);

            expect(result).toBe(resolved);
            expect(element.hasAttribute(hiddenAttribute)).toBe(hidden);

        });

        it('Should show an element (by removing the [hidden] attribute) ' +
            'if the conditional returns true.', function () {

            var attributeValue = 'presentKey';
            var resolved = true;
            var hidden = false;
            var result;

            element.removeAttribute(hiddenAttribute);
            element.setAttribute(attributeName, attributeValue);

            result = View.updateConditionals(element, data, attributeName);

            expect(result).toBe(resolved);
            expect(element.hasAttribute(hiddenAttribute)).toBe(hidden);

        });

    });

    describe('.updateAttributes()', function () {

        var element = document.body;
        var attributeName = 'data-var';

        it('Should replace constant values.', function () {

            var constantValue = 'x';
            var data = null;
            var attributeValue = JSON.stringify({
                'title': constantValue
            });

            element.setAttribute(attributeName, attributeValue);

            View.updateAttributes(element, data, attributeName);

            expect(element.getAttribute('title')).toBe(constantValue);

        });

        it('Should replace variables.', function () {

            var data = {'x': 'y'};
            var attributeValue = JSON.stringify({
                'title': '${x}'
            });

            element.setAttribute(attributeName, attributeValue);

            View.updateAttributes(element, data, attributeName);

            expect(element.getAttribute('title')).toBe(data.x);

        });

        test.each([
            [null],
            /*
             * @TODO Test undefined values.
             * [undefined]
             */
        ])('Should not replace %s values.', function (variable) {

            var element = document.body;
            var attributeValue = JSON.stringify({
                'title': '${' + variable + '}'
            });
            var data = {};
            var result;

            data[variable] = variable;

            element.removeAttribute('title');
            element.setAttribute(attributeName, attributeValue);

            result = View.updateAttributes(element, data, attributeName);

            expect(element.hasAttribute('title')).toBe(false);
            expect(result).toBe(true);

        });

    });

    describe('.getAliases()', function () {

        it('Should get aliases.', function () {

            var element = document.body;
            var data = {'a': {'b': 1}};
            var attributeName = 'data-var-as';
            var attributeValue = JSON.stringify({
                'alias': 'a.b'
            });
            var result;

            element.setAttribute(attributeName, attributeValue);

            result = View.getAliases(element, data, attributeName);

            expect(result).toMatchObject({
                'alias': data.a.b
            });

        });

    });

    describe('.updateLoops()', function () {

        it('Should generate new elements in order, based on a template.', function () {

            var data = {'the': {'items': [1, 2]}};
            var container = document.body;
            var attributeName = 'data-var-for';
            var template, result, generatedElements, expectedElementsCount;

            container.innerHTML = [
                '<span id=\'element\' class=\'template\' data-var-for=\'item in the.items\' hidden>',
                '<span data-var-for-item=\'${item}\'></span>',
                '</span>'
            ].join('');

            template = container.querySelector('#element');
            result = View.updateLoops(template, data, attributeName);
            generatedElements = container.querySelectorAll('.element');
            expectedElementsCount = Object.keys(data.the.items).length;

            // Should return the updated views.
            expect(result).toMatchObject([
                expect.any(View),
                expect.any(View)
            ]);
            // Should update in the DOM and respect order.
            expect(generatedElements.length).toBe(expectedElementsCount);
            expect(container.children.length).toBe(expectedElementsCount + 1); // generated + template.
            expect(container.children[0]).toBe(template);
            expect(container.children[1]).toBe(generatedElements[0]);
            expect(container.children[2]).toBe(generatedElements[1]);
            // Should remove ids from generated elements (and set it as a class).
            expect(generatedElements[0].hasAttribute('id')).toBe(false);
            expect(generatedElements[1].hasAttribute('id')).toBe(false);
            // Should remove the .template class from generated elements.
            expect(generatedElements[0].classList.contains('template')).toBe(false);
            expect(generatedElements[1].classList.contains('template')).toBe(false);
            // Should remove the [hidden] attribute from generated elements.
            expect(generatedElements[0].hasAttribute('hidden')).toBe(false);
            expect(generatedElements[1].hasAttribute('hidden')).toBe(false);
            // Should update data on children.
            expect(generatedElements[0].querySelector('span').textContent).toBe(data.the.items[0].toString());
            expect(generatedElements[1].querySelector('span').textContent).toBe(data.the.items[1].toString());

        });

        test.each([
            [{'the': {'items': [3, 4]}}],
            [{'the': {'items': [2]}}],
            [{'the': {'items': [5, 6, 7]}}]
        ])('Should update elements.', function (givenData) {

            var container = document.body;
            var attributeName = 'data-var-for';
            var data, template;

            container.innerHTML = [
                '<span id=\'element\' class=\'template\' data-var-for=\'item in the.items\' hidden>',
                '<span data-var-for-item=\'${item}\'></span>',
                '</span>'
            ].join('');
            template = container.querySelector('#element');

            // Generate 2 items.
            data = {'the': {'items': [1, 2]}};
            View.updateLoops(template, data, attributeName);

            data = givenData;
            View.updateLoops(template, data, attributeName);

            expect(container.children.length).toBe(givenData.the.items.length + 1); // given + template.
            expect(container.children[0]).toBe(template);
            givenData.the.items.forEach(function (value, i) {

                // Skip the first for the template.
                expect(container.children[i + 1].querySelector('span').textContent).toBe(value.toString());

            });

        });

        test.each([
            [null],
            [{'the': null}],
            [{'the': {'items': null}}],
            [{'the': {'items': []}}]
        ])('Should remove elements if updated data is empty.', function (givenData) {

            var data = {'the': {'items': [1, 2]}};
            var container = document.body;
            var attributeName = 'data-var-for';
            var template;

            container.innerHTML = [
                '<span id=\'element\' class=\'template\' data-var-for=\'item in the.items\' hidden>',
                '<span data-var-for-item=\'${item}\'></span>',
                '</span>'
            ].join('');
            template = container.querySelector('#element');

            // Generate 2 items.
            data = {'the': {'items': [1, 2]}};
            View.updateLoops(template, data, attributeName);

            data = givenData;
            View.updateLoops(template, data, attributeName);

            expect(container.children.length).toBe(1);
            expect(container.children[0]).toBe(template);

        });

        it('Should expose loop data.', function () {

            var data = {'items': [1, 2], 'fn': jest.fn()};
            var container = document.body;
            var attributeName = 'data-var-for';
            var template;

            container.innerHTML = [
                '<span id=\'element\' class=\'template\' data-var-for=\'item in items\' hidden>',
                '<span data-var-for-item=\'${fn(loop)}\'></span>',
                '</span>'
            ].join('');
            template = container.querySelector('#element');

            View.updateLoops(template, data, attributeName);

            expect(data.fn).toHaveBeenNthCalledWith(1, {
                'index': 0,
                'array': data.items,
                'length': data.items.length,
                'left': data.items.length
            });
            expect(data.fn).toHaveBeenNthCalledWith(2, {
                'index': 1,
                'array': data.items,
                'length': data.items.length,
                'left': data.items.length - 1
            });

        });

        it('Should expose the current element under `this`.', function () {

            var data = {'items': [1], 'fn': jest.fn()};
            var container = document.body;
            var attributeName = 'data-var-for';
            var template;

            container.innerHTML = [
                '<span id=\'element\' class=\'template\' data-var-for=\'item in items\' hidden>',
                '<span data-var-for-item=\'${fn(this)}\'></span>',
                '</span>'
            ].join('');
            template = container.querySelector('#element');

            View.updateLoops(template, data, attributeName);

            expect(data.fn).toHaveBeenNthCalledWith(1, container.children[1]);

        });

        it('Should update the container even if the given element ' +
            'is not connected to the DOM, but contains a cached view.', function () {

            var container = document.body;
            var attributeName = 'data-var-for';
            var data, template, disconnectedElement, result;

            container.innerHTML = [
                '<span id=\'element\' class=\'template\' data-var-for=\'item in items\' hidden>',
                '<span data-var-for-item=\'${fn(this)}\'></span>',
                '</span>'
            ].join('');
            template = container.querySelector('#element');

            // Generate items.
            data = {'items': [1], 'fn': jest.fn()};
            View.updateLoops(template, data, attributeName);

            // Disconnect generated element from DOM.
            disconnectedElement = container.removeChild(container.lastChild);
            // Set the removed [data-var-for] attribute as if it were the template.
            disconnectedElement.setAttribute(attributeName, 'item in items');

            // Expect to have a cached view to know its template.
            expect(disconnectedElement).toHaveProperty('view');
            expect(function () {

                data = {'items': [1, 2], 'fn': jest.fn()};
                result = View.updateLoops(disconnectedElement, data, attributeName);

            }).not.toThrow();
            expect(result).toMatchObject([
                expect.any(View),
                expect.any(View)
            ]);
            expect(container.children.length).toBe(2 + 1); // 2 + template

        });

        it('Should prevent (silent) recursiveness.', function () {

            var container = document.body;
            var attributeName = 'data-var-for';
            var data = {'items': [1], 'fn': jest.fn()};
            var template;

            container.innerHTML = [
                '<span id=\'element\' class=\'template\' data-var-for=\'item in items\' hidden>',
                '<span data-var-for-item=\'${fn(this)}\'></span>',
                '</span>'
            ].join('');
            template = container.querySelector('#element');

            // Generate items.
            View.updateLoops(template, data, attributeName);

            /**
             * Recursive looping is caused by this attribute
             * on generated elements.
             *
             * @TODO Detect recursiveness instead.
             */
            expect(container.lastChild.hasAttribute(attributeName)).toBe(false);

        });

    });

    describe('.attachListeners()', function () {

        it('Should access to the given data and attach listeners.', function () {

            var element = document.body;
            var attributeName = 'data-var-on';
            var fn = jest.fn();
            var data = {
                'listeners': {
                    'custom': function (e) { fn(this, e); }
                }
            };
            var event = new CustomEvent('custom');
            var result;

            element.setAttribute(attributeName, JSON.stringify({
                'custom': 'listeners.custom'
            }));

            result = View.attachListeners(element, data, attributeName);
            element.dispatchEvent(event);

            expect(result).toMatchObject({
                'custom': data.listeners.custom
            });
            expect(fn).toHaveBeenCalledWith(element, event);

            element.removeAttribute(attributeName);
            element.removeEventListener('custom', result.custom);

        });

    });

    describe('#attachListeners()', function () {

        it('Should call View.attachListeners() with #getElement() ' +
            '#getData(), and #attributes.on as arguments.', function () {

            var element = document.body;
            var attributeName = 'data-var-on';
            var data = {
                'listeners': {
                    'custom': jest.fn()
                }
            };
            var event = new CustomEvent('custom');
            var view, result;

            element.setAttribute(attributeName, JSON.stringify({
                'custom': 'listeners.custom'
            }));

            view = new View({
                'element': element,
                'data': data
            });

            result = view.attachListeners();

            element.dispatchEvent(event);

            // @TODO Mock View.attachListeners() instead.

            expect(result).toBe(view);
            expect(data.listeners.custom).toHaveBeenCalledWith(event);

            element.removeAttribute(attributeName);
            element.removeEventListener('custom', result.custom);

        });

    });

    describe('#getElement()', function () {

        it('Should return #element if set.', function () {

            var element = document.body;
            var view = new View({
                'element': element
            });

            expect(view.getElement()).toBe(element);

        });

        it('Should query an element by #id if #element is not set.', function () {

            var view = new View({
                'id': 'x'
            });
            var element = document.createElement('span');

            element.id = view.id;
            document.body.appendChild(element);

            expect(view.getElement()).toBe(element);

            document.body.removeChild(element);

        });

    });

    describe('#getData()', function () {

        it('Should return all available data in the following order:' +
            '#globals, #data, #getData()~currentData, and .getAliases().', function () {

            var globals = {'global': true};
            var locals = {'local': true};
            var aliases = {'alias': true};
            var current = {'current': true};
            var element = document.body;
            var result;

            element.setAttribute('data-var-as', JSON.stringify(aliases));
            Object.assign(View.globals, globals);
            result = new View({
                'element': element,
                'data': locals
            }).getData(current);

            // Expect the following order.
            expect(result).toMatchObject(Object.assign({}, globals, locals, current, aliases));

            delete View.globals.global;
            element.removeAttribute('data-var-as');

        });

    });

    describe('#reset()', function () {

        it('Should restore the constructor\'s original ' +
            'properties.', function () {

            var view = new View();
            var originalProperties = Object.assign({}, view);

            // The "original" property shouldn't be cyclic.
            delete originalProperties.original;

            // Modify.
            view.id = 'another-id';

            // Restore.
            view.reset();

            expect(view).toHaveProperty('original');
            expect(view.original).toMatchObject(originalProperties);
            expect(view.original).not.toHaveProperty('original');
            expect(view).toMatchObject(originalProperties);

        });

    });

    describe('#refresh', function () {

        // @TODO Improve.
        it('Should make an update using #previousData and newData.', function () {

            var fn = jest.fn();
            var element = document.body;
            var view = new View({
                'element': element,
                'data': {
                    'fn': fn
                }
            });
            var update = {
                'a': 'update',
                'b': 'update'
            };
            var refresh = {
                'b': 'refresh'
            };

            // Prepare:
            element.setAttribute('data-var', '${fn(a, b)}');

            // Make a normal update to set #previousData.
            view.update(update);

            // Update only the new property.
            view.refresh(refresh);

            // @TODO Mock #update() instead.
            expect(fn).toHaveBeenCalledWith('update', 'refresh');

            element.removeAttribute('data-var');

        });

    });

});
