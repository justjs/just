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

});
