var from = require('@lib/from');
var defaults = require('@lib/defaults');

describe('@lib/from.js', function () {

    it('Should be an alias of defaults.', function () {

        expect(from).toBe(defaults);

    });

});
