var server = require('@src/server');

describe('@src/server.js', function () {

    it('Should return a Common JS module.', function () {

        expect(server).toMatchObject({});

    });

});
