var createElement = require('@lib/createElement');

describe('@lib/createElement.js', function () {

    it('Should create an element.', function () {

        expect(createElement('script')).toBeInstanceOf(HTMLScriptElement);

    });

    it('Should set properties on the created element.', function () {

        var element = createElement('abbr', {
            'title': 'title'
        });

        expect(element.title).toBe('title');

    });

});
