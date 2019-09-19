var test = require('tape');
var ClassList = require('../../src/lib/ClassList');

test('lib/ClassList.js', function (t) {

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

    t.test('Should be a constructor.', function (st) {

        st.is(ClassList() instanceof ClassList, true);
        st.is(new ClassList() instanceof ClassList, true);

        st.end();

    });

    t.test('apply()', function (st) {

        st.test('Should have a custom "apply" function.', function (sst) {

            sst.is('apply' in ClassList, true);
            sst.end();

        });

        st.test('Should work as Element.classList.prototype.add', function (sst) {

            removeClass(element, 'a');

            sst.is(ClassList.apply(element, 'add', 'a'), void 0);
            sst.is(containsClass(element, 'a'), true);

            removeClass(element, 'a', 'b');

            sst.is(ClassList.apply(element, 'add', ['a', 'b']), void 0);
            sst.is(containsClass(element, 'a'), true);
            sst.is(containsClass(element, 'b'), true);

            sst.end();

        });

        st.test('Should work as Element.classList.prototype.remove', function (
            sst) {

            addClass(element, 'a');

            sst.is(ClassList.apply(element, 'remove', 'a'), void 0);
            sst.is(containsClass(element, 'a'), false);

            addClass(element, 'a', 'b');

            sst.is(ClassList.apply(element, 'remove', ['a', 'b']), void 0);
            sst.is(containsClass(element, 'a'), false);
            sst.is(containsClass(element, 'b'), false);

            sst.end();

        });

        st.test('Should work as Element.classList.prototype.toggle', function (
            sst) {

            removeClass(element, 'a');

            sst.is(ClassList.apply(element, 'toggle', 'a'), true);
            sst.is(containsClass(element, 'a'), true);

            sst.is(ClassList.apply(element, 'toggle', ['a', true]), true);
            sst.is(containsClass(element, 'a'), true);

            sst.is(ClassList.apply(element, 'toggle', 'a'), false);
            sst.is(containsClass(element, 'a'), false);

            sst.throws(function () {

                ClassList.apply(element, 'toggle');

            }, TypeError, 'Not enough arguments.');

            sst.end();

        });

        st.test('Should work as Element.classList.prototype.replace', function (
            sst) {

            addClass(element, 'a');
            removeClass(element, 'b');

            sst.is(/(undefined|boolean)/.test(
                typeof ClassList.apply(element, 'replace', ['a', 'b'])
            ), true);
            sst.is(containsClass(element, 'a'), false);
            sst.is(containsClass(element, 'b'), true);

            sst.throws(function () {

                ClassList.apply(element, 'replace');

            }, TypeError, 'Not enough arguments.');

            sst.end();

        });

        st.test('Should work as Element.classList.prototype.contains', function (
            sst) {

            addClass(element, 'a');
            removeClass(element, 'b');

            sst.is(ClassList.apply(element, 'contains', 'a'), true);
            sst.is(ClassList.apply(element, 'contains', 'b'), false);

            sst.throws(function () {

                ClassList.apply(element, 'contains');

            }, TypeError, 'Not enough arguments.');

            sst.end();

        });

        st.test('Should work as Element.classList.prototype.item', function (sst) {

            var emptyElement = document.createElement('a');

            addClass(emptyElement, 'a');

            sst.is(ClassList.apply(emptyElement, 'item', 0), 'a');
            sst.is(ClassList.apply(emptyElement, 'item', 1), null);

            sst.throws(function () {

                ClassList.apply(emptyElement, 'item');

            }, TypeError, 'Not enough arguments.');

            sst.end();

        });

        st.end();

    });

    t.test('Should chain Element.classList.addClass and add ' +
        'classes.', function (st) {

        removeClass(element, 'a', 'b');

        st.is('add' in ClassList(element), true);
        st.is(ClassList(element).add('a', 'b') instanceof ClassList, true);
        st.is(containsClass(element, 'a'), true);
        st.is(containsClass(element, 'b'), true);

        st.end();

    });

    t.test('Should chain Element.classList.removeClass and remove ' +
        'classes.', function (st) {

        addClass(element, 'a', 'b');

        st.is('remove' in ClassList(element), true);
        st.is(ClassList(element).remove('a', 'b') instanceof ClassList, true);
        st.is(containsClass(element, 'a'), false);
        st.is(containsClass(element, 'b'), false);

        st.end();

    });

    t.test('Should chain Element.classList.toggle and toggle classes.', function (
        st) {

        removeClass(element, 'a');

        st.is('toggle' in ClassList(element), true);
        st.is(ClassList(element).toggle('a') instanceof ClassList, true);
        st.is(containsClass(element, 'a'), true);

        st.is(ClassList(element).toggle('a', true) instanceof ClassList, true);
        st.is(containsClass(element, 'a'), true);

        st.is(ClassList(element).toggle('a') instanceof ClassList, true);
        st.is(containsClass(element, 'a'), false);

        st.end();

    });

    t.test('Should chain Element.classList.replace and replace classes.', function (
        st) {

        addClass(element, 'a');
        removeClass(element, 'b');

        st.is('replace' in ClassList(element), true);
        st.is(ClassList(element).replace('a', 'b') instanceof ClassList, true);
        st.is(containsClass(element, 'a'), false);
        st.is(containsClass(element, 'b'), true);

        st.end();

    });

    t.test('Should NOT chain Element.classList.contains and should check if ' +
        'the element contains the given classes.', function (st) {

        addClass(element, 'a');
        removeClass(element, 'b');

        st.is('contains' in ClassList(element), true);
        st.is(ClassList(element).contains('a'), true);
        st.is(ClassList(element).contains('b'), false);

        st.end();

    });

    t.test('Should NOT chain Element.classList.item and should return ' +
        'the value of the class from the specified index.', function (st) {

        var emptyElement = document.createElement('a');

        addClass(emptyElement, 'a');

        st.is('item' in ClassList(element), true);
        st.is(ClassList(emptyElement).item(0), 'a');
        st.is(ClassList(emptyElement).item(1), null);

        st.end();

    });

    t.end();

});
