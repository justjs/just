var ClassList = require('@lib/ClassList');

describe('@lib/ClassList.js', function () {

    var element = document.body;
    var containsClass = function (target, className) {

        return new RegExp('\\b' + className + '\\b').test(target.className);

    };
    var addClass = function (target, className) {

        if (!containsClass(target, className)) {

            target.className = (target.className + ' ' + className).trim();

        }

    };
    var removeClass = function (target, className) {

        target.className = target.className.replace(
            new RegExp('(^| )' + className + '( |$)'),
            ' '
        ).trim();

    };

    it('Should be a constructor.', function () {

        expect(ClassList()).toBeInstanceOf(ClassList);
        expect(new ClassList()).toBeInstanceOf(ClassList);

    });

    describe('apply()', function () {

        it('Should have a custom "apply" function.', function () {

            expect(ClassList).toHaveProperty('apply');

        });

        it('Should work as Element.classList.prototype.add', function () {

            removeClass(element, 'a');

            expect(ClassList.apply(element, 'add', 'a')).toBeUndefined();
            expect(containsClass(element, 'a')).toBe(true);

            removeClass(element, 'a', 'b');

            expect(ClassList.apply(element, 'add', ['a', 'b'])).toBeUndefined();
            expect(containsClass(element, 'a')).toBe(true);
            expect(containsClass(element, 'b')).toBe(true);

        });

        it('Should work as Element.classList.prototype.remove', function () {

            addClass(element, 'a');

            expect(ClassList.apply(element, 'remove', 'a')).toBeUndefined();
            expect(containsClass(element, 'a')).toBe(false);

            addClass(element, 'a', 'b');

            expect(ClassList.apply(element, 'remove', ['a', 'b'])).toBeUndefined();
            expect(containsClass(element, 'a')).toBe(false);
            expect(containsClass(element, 'b')).toBe(false);

        });

        it('Should work as Element.classList.prototype.toggle', function () {

            removeClass(element, 'a');

            expect(ClassList.apply(element, 'toggle', 'a')).toBe(true);
            expect(containsClass(element, 'a')).toBe(true);

            expect(ClassList.apply(element, 'toggle', ['a', true])).toBe(true);
            expect(containsClass(element, 'a')).toBe(true);

            expect(ClassList.apply(element, 'toggle', 'a')).toBe(false);
            expect(containsClass(element, 'a')).toBe(false);

            expect(function () {

                /** Not enough arguments. */
                ClassList.apply(element, 'toggle');

            }).toThrow(TypeError);

        });

        it('Should work as Element.classList.prototype.replace', function () {

            addClass(element, 'a');
            removeClass(element, 'b');

            expect(
                typeof ClassList.apply(element, 'replace', ['a', 'b'])
            ).toMatch(/(undefined|boolean)/);
            expect(containsClass(element, 'a')).toBe(false);
            expect(containsClass(element, 'b')).toBe(true);

            expect(function () {

                /** Not enough arguments. */
                ClassList.apply(element, 'replace');

            }).toThrow(TypeError);

        });

        it('Should work as Element.classList.prototype.contains', function () {

            addClass(element, 'a');
            removeClass(element, 'b');

            expect(ClassList.apply(element, 'contains', 'a')).toBe(true);
            expect(ClassList.apply(element, 'contains', 'b')).toBe(false);

            expect(function () {

                /** Not enough arguments. */
                ClassList.apply(element, 'contains');

            }).toThrow(TypeError);

        });

        it('Should work as Element.classList.prototype.item', function () {

            var emptyElement = document.createElement('a');

            addClass(emptyElement, 'a');

            expect(ClassList.apply(emptyElement, 'item', 0)).toBe('a');
            expect(ClassList.apply(emptyElement, 'item', 1)).toBeNull();

            expect(function () {

                /** Not enough arguments. */
                ClassList.apply(emptyElement, 'item');

            }).toThrow(TypeError);

        });

    });

    it('Should chain Element.classList.addClass and add classes.', function () {

        removeClass(element, 'a', 'b');

        expect(ClassList(element)).toHaveProperty('add');
        expect(ClassList(element).add('a', 'b')).toBeInstanceOf(ClassList);
        expect(containsClass(element, 'a')).toBe(true);
        expect(containsClass(element, 'b')).toBe(true);

    });

    it('Should chain Element.classList.removeClass and remove classes.', function () {

        addClass(element, 'a', 'b');

        expect(ClassList(element)).toHaveProperty('remove');
        expect(ClassList(element).remove('a', 'b')).toBeInstanceOf(ClassList);
        expect(containsClass(element, 'a')).toBe(false);
        expect(containsClass(element, 'b')).toBe(false);

    });

    it('Should chain Element.classList.toggle and toggle classes.', function () {

        removeClass(element, 'a');

        expect(ClassList(element)).toHaveProperty('toggle');
        expect(ClassList(element).toggle('a')).toBeInstanceOf(ClassList);
        expect(containsClass(element, 'a')).toBe(true);

        expect(ClassList(element).toggle('a', true)).toBeInstanceOf(ClassList);
        expect(containsClass(element, 'a')).toBe(true);

        expect(ClassList(element).toggle('a')).toBeInstanceOf(ClassList);
        expect(containsClass(element, 'a')).toBe(false);

    });

    it('Should chain Element.classList.replace and replace classes.', function () {

        addClass(element, 'a');
        removeClass(element, 'b');

        expect(ClassList(element)).toHaveProperty('replace');
        expect(ClassList(element).replace('a', 'b')).toBeInstanceOf(ClassList);
        expect(containsClass(element, 'a')).toBe(false);
        expect(containsClass(element, 'b')).toBe(true);

    });

    it('Should NOT chain Element.classList.contains and should check if ' +
        'the element contains the given classes.', function () {

        addClass(element, 'a');
        removeClass(element, 'b');

        expect(ClassList(element)).toHaveProperty('contains');
        expect(ClassList(element).contains('a')).toBe(true);
        expect(ClassList(element).contains('b')).toBe(false);

    });

    it('Should NOT chain Element.classList.item and should return ' +
        'the value of the class from the specified index.', function () {

        var emptyElement = document.createElement('a');

        addClass(emptyElement, 'a');

        expect(ClassList(element)).toHaveProperty('item');
        expect(ClassList(emptyElement).item(0)).toBe('a');
        expect(ClassList(emptyElement).item(1)).toBeNull();

    });

});
