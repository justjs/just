var getRemoteParent = require('@lib/getRemoteParent');

describe('@lib/getRemoteParent.js', function () {

    var html = document.documentElement;
    var body = document.body;

    it('Should work as expected and return a remote parent.', function () {

        var child = body;
        var expectedParent = html;
        var expectedDeepLevels = {
            'BODY': 0,
            'HTML': 1
        };
        var parent = getRemoteParent(child, function (deepLevel, rootContainer) {

            /** `this` is always a Node. */
            expect(this).toBeInstanceOf(Node);
            /** `deepLevel` increases every falsy call. */
            expect(expectedDeepLevels[this.tagName]).toBe(deepLevel);
            /**
             * `rootContainer` must be the root element (html)
             * if not provided.
             */
            expect(rootContainer).toBe(html);

            return this === expectedParent;

        });

        /**
         * The given function returned a truthy value, so the current node
         * was returned.
         */
        expect(parent).toBe(expectedParent);

    });

    it('Should go up through the child parents ' +
		'until the expected parent is found.', function () {

        var child = body;
        var expectedParent = html;
        var parent = getRemoteParent(child, function (deepLevel, rootContainer) {

            return this === expectedParent;

        });

        expect(parent).toBe(expectedParent);

    });

    it('Should return `null` if the expected parent ' +
		'is not found.', function () {

        var returnFalse = function () {

            return false;

        };

        /** The expected parent was not found. */
        expect(getRemoteParent(html, returnFalse)).toBeNull();
        /** There's no parent node, so `null` is expected. */
        expect(getRemoteParent(document.createElement('a'), returnFalse)).toBeNull();

    });

    it('Should throw if something is invalid.', function () {

        expect(function () {

            /* The given child is not an instance of a Node. */
            getRemoteParent(window, function () {});

        }).toThrow(TypeError);

        expect(function () {

            /* No function was given. */
            getRemoteParent(body);

        }).toThrow(TypeError);

    });

    it('Should stop at the given container.', function () {

        var child = body;
        var remoteParent = getRemoteParent(child, function () {

            return this === html;

        }, body);

        /** The function stopped at `body` and the element wasn't found. */
        expect(remoteParent).toBeNull();

    });

    it('Should not ignore the child node.', function () {

        var includeChild = true;
        var child = body;
        var parent = getRemoteParent(child, function () {

            return this === child;

        }, null, includeChild);

        /**
         * The function included the child as part of the check because
         * `includeChild` was a truthy value.
         */
        expect(parent).toBe(child);

    });

});
