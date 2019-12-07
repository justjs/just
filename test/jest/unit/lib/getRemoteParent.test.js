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
        var fn = jest.fn(function (deepLevel, rootContainer) {

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
        var parent = getRemoteParent(child, fn);

        expect(fn).toHaveBeenCalledTimes(1);
        /**
         * The given function returned a truthy value, so the current node
         * was returned.
         */
        expect(parent).toBe(expectedParent);

    });

    it('Should go up through the child parents ' +
		'until the expected parent is found.', function () {

        var child = body.appendChild(document.createElement('div'));
        var expectedParent = html;
        var fn = jest.fn(function () { return this === expectedParent; });
        var parent = getRemoteParent(child, fn);

        expect(fn).toHaveBeenCalledTimes(2);
        // expect(fn).toHaveBeenNthCalledWith(1, html);
        expect(fn).toHaveNthReturnedWith(1, false);
        // expect(fn).toHaveBeenNthCalledWith(2, html);
        expect(fn).toHaveNthReturnedWith(2, true);
        expect(parent).toBe(expectedParent);

    });

    it('Should return `null` if the expected parent ' +
		'is not found.', function () {

        var returnFalse = jest.fn(function () { return false; });

        /** The expected parent was not found. */
        expect(getRemoteParent(body, returnFalse)).toBeNull();
        expect(returnFalse).toHaveBeenCalledTimes(1);
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

        var fn = jest.fn(function () { return this === html; });

        /** The function stopped at `body` and the element wasn't found. */
        expect(getRemoteParent(body, fn, body)).toBeNull();
        expect(fn).not.toHaveBeenCalled();

    });

    it('Should not ignore the child node.', function () {

        var includeChild = true;
        var child = body;
        var fn = jest.fn(function () { return this === child; });

        /**
         * The function included the child as part of the check because
         * `includeChild` was a truthy value.
         */
        expect(getRemoteParent(child, fn, null, includeChild)).toBe(child);
        expect(fn).toHaveBeenCalledTimes(1);

    });

});
