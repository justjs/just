var test = require('tape');
var getRemoteParent = require('../../src/lib/getRemoteParent');
var options = {'skip': typeof window === 'undefined'};

test('lib/getRemoteParent.js', options, function (t) {

    var html = document.documentElement;
    var body = document.body;

    t.test('Should work as expected and return a remote parent.', function (st) {

        var child = body;
        var expectedParent = html;
        var expectedDeepLevels = {
            'BODY': 0,
            'HTML': 1
        };
        var parent = getRemoteParent(child,
            function (deepLevel, rootContainer) {

                st.is(this instanceof Node, true,
                    '`this` is always a Node.');

                st.is(expectedDeepLevels[this.tagName], deepLevel,
                    '`deepLevel` increases every falsy call.');

                st.is(rootContainer, html,
                    '`rootContainer` must be the root element (html) ' +
			'if not provided.');

                return this === expectedParent;

            });

        st.is(parent, expectedParent, 'The given function ' +
		'returned a truthy value, so the current node ' +
		' was returned.');

        st.end();

    });

    t.test('Should go up through the child parents ' +
		'until the expected parent is found.', function (st) {

        var child = body;
        var expectedParent = html;
        var parent = getRemoteParent(child,
            function (deepLevel, rootContainer) {

                return this === expectedParent;

            });

        st.is(parent, expectedParent, 'The expected parent ' +
			'was found.');

        st.end();

    });

    t.test('Should return `null` if the expected parent ' +
		'is not found.', function (st) {

        var returnFalse = function () {

            return false;

        };

        st.is(getRemoteParent(html, returnFalse), null,
            'The expected parent was not found.');

        st.is(getRemoteParent(document.createElement('a'), returnFalse), null,
            'There\'s no parent node, so `null` is expected.');

        st.end();

    });

    t.test('Should throw if something is invalid.', function (st) {

        st.plan(2);

        st.throws(function () {

            var child = window;

            getRemoteParent(child, function () {});

        }, TypeError, 'The given child is not an instance of a Node.');

        st.throws(function () {

            getRemoteParent(body);

        }, TypeError, 'No function was given.');

    });

    t.test('Should stop at the given container.', function (st) {

        var child = body;
        var remoteParent = getRemoteParent(child, function () {

            return this === html;

        }, body);

        st.is(remoteParent, null, 'The function stopped at `body` ' +
			'and the element wasn\'t found.');

        st.end();

    });

    t.test('Should not ignore the child node.', function (st) {

        var includeChild = true;
        var child = body;
        var parent = getRemoteParent(child, function () {

            return this === child;

        }, null, includeChild);

        st.is(parent, child, 'The function included the child as ' +
			'part of the check because `includeChild` was a ' +
			'truthy value.');

        st.end();

    });

    t.end();

});