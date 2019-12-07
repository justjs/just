var parent = require('@lib/parent');
var getRemoteParent = require('@lib/getRemoteParent');

describe('@lib/parent.js', function () {

    it('Should be an alias of getRemoteParent.', function () {

        expect(parent).toBe(getRemoteParent);

    });

});
