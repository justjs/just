var Def = require('@lib/Def');
var Define = require('@lib/Define');

describe('@lib/Def.js', function () {

    it('Should be an alias of Define.', function () {

        expect(Def).toBe(Define);

    });

});
