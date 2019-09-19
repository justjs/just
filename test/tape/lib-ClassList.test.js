var test = require('tape');
var ClassList = require('../../src/lib/ClassList');

test('lib/ClassList', function (t) {

    var element = document.body;
    var containsClass = function (element, className) {

        return new RegExp('\\b' + className + '\\b').test(element.className);

    };
    var addClass = function (element, className) {

        if (!containsClass(element, className)) {

            element.className += className;

        }

    };
    var removeClass = function (element, className) {

        element.className = element.className.replace(
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

        t.test('Should work as Element.classList.prototype.add', function (sst) {

            removeClass(element, 'a');

            sst.is(ClassList.apply(element, 'add', 'a'), void 0);
            sst.is(containsClass(element, 'a'), true);

            removeClass(element, 'a', 'b');

            sst.is(ClassList.apply(element, 'add', ['a', 'b']), void 0);
            sst.is(containsClass(element, 'a'), true);
            sst.is(containsClass(element, 'b'), true);

            sst.end();

        });

        t.test('Should work as Element.classList.prototype.remove', function (sst) {

            addClass(element, 'a');

            sst.is(ClassList.apply(element, 'remove', 'a'), void 0);
            sst.is(containsClass(element, 'a'), false);

            addClass(element, 'a', 'b');

            sst.is(ClassList.apply(element, 'remove', ['a', 'b']), void 0);
            sst.is(containsClass(element, 'a'), false);
            sst.is(containsClass(element, 'b'), false);

            sst.end();

        });

        t.test('Should work as Element.classList.prototype.toggle', function (sst) {

            removeClass(element, 'a');

            sst.is(ClassList.apply(element, 'toggle', 'a'), void 0);
            sst.is(containsClass(element, 'a'), true);

            sst.is(ClassList.apply(element, 'toggle', ['a', true]), void 0);
            sst.is(containsClass(element, 'a'), true);

            sst.is(ClassList.apply(element, 'toggle', 'a'));
            sst.is(containsClass(element, 'a'), false);

            sst.throws(function () {

                ClassList.apply(element, 'toggle');

            }, TypeError, 'Not enough arguments.');

            sst.end();

        });

        t.test('Should work as Element.classList.prototype.replace', function (sst) {

            addClass(element, 'a');
            removeClass(element, 'b');

            sst.is(ClassList.apply(element, 'replace', ['a', 'b']), void 0);
            sst.is(containsClass(element, 'a'), false);
            sst.is(containsClass(element, 'b'), true);

            sst.throws(function () {

                ClassList.apply(element, 'replace', 'a');

            }, TypeError, 'Not enough arguments.');

            sst.end();

        });

        t.test('Should work as Element.classList.prototype.contains', function (sst) {

            addClass(element, 'a');
            removeClass(element, 'b');

            sst.is(ClassList.apply(element, 'contains', 'a'), true);
            sst.is(ClassList.apply(element, 'contains', 'b'), false);

            sst.throws(function () {

                ClassList.apply(element, 'contains');

            }, TypeError, 'Not enough arguments.');

            sst.end();

        });

        t.test('Should work as Element.classList.prototype.item', function (sst) {

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

    t.test('Should chain addClass element, and add classes.', function (st) {

        removeClass(element, 'a', 'b');

        st.is(ClassList(element).add('a', 'b') instanceof ClassList, true);
        st.is(containsClass(element, 'a'), true);
        st.is(containsClass(element, 'b'), true);

        st.end();

    });

    t.test('Should chain removeClass element, and remove classes.', function (st) {

        addClass(element, 'a', 'b');

        st.is(ClassList(element).remove('a', 'b') instanceof ClassList, true);
        st.is(containsClass(element, 'a'), false);
        st.is(containsClass(element, 'b'), false);

        st.end();

    });

    t.test('Should chain Element.classList.toggle and toggle classes.', function (
        st) {

        removeClass(element, 'a');

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

        st.is(ClassList(element).replace('a', 'b') instanceof ClassList, true);
        st.is(containsClass(element, 'a'), false);
        st.is(containsClass(element, 'b'), true);

        st.end();

    });

    t.test('Should NOT chain Element.classList.contains and should check if ' +
        'the element contains the given classes.', function (st) {

        addClass(element, 'a');
        removeClass(element, 'b');

        st.is(ClassList(element).contains('a'), true);
        st.is(ClassList(element).contains('b'), false);

        st.end();

    });

    t.test('Should NOT chain Element.classList.item and should return ' +
        'the value of the class from the specified index.', function (st) {

        var emptyElement = document.createElement('a');

        addClass(emptyElement, 'a');

        st.is(ClassList(emptyElement).item(0), 'a');
        st.is(ClassList(emptyElement).item(1), null);

        st.end();

    });

    t.end();

});
