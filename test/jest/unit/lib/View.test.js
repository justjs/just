var View = require('@lib/View.js');

describe.only('@lib/View.js', function () {

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

    });

    describe('.replaceVars()', function () {

        it('Should replace a ${splitted.property} with its accessed ' +
            'value.', function () {

            var result = View.replaceVars('{${splitted.property}}!', {
                'splitted': {'property': 'hey'}
            });

            expect(result).toBe('{hey}!');

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
            var expectedText = data.x;
            var setter = function () {};
            var result;

            element.setAttribute(attributeName, attributeValue);

            result = View.updateVars(element, data, attributeName, setter);

            // expect(setter).toHaveBeenCalledWith(element, expectedText);
            // expect(setter).toHaveReturned(void 0);
            expect(result).toBe(false);

            element.removeAttribute(attributeName);

        });

    });

});
