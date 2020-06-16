var ajax = require('@lib/ajax');
var request = require('@lib/request');

describe('@lib/ajax.js', function () {

    it('Should be an alias of request.', function () {

        expect(ajax).toBe(request);

    });

});
