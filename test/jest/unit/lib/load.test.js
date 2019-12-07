var load = require('@lib/load');
var loadElement = require('@lib/loadElement');

describe('@lib/load.js', function () {

    it('Should be an alias of loadElement.', function () {

        expect(load).toBe(loadElement);

    });

});
