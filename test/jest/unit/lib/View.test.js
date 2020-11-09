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

    });

});
