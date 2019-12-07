var fs = require('fs');
var core = require('@lib/core');

describe('@lib/core', function () {

    it('Should contain a function to register members on Just.', function () {

        expect(core).toMatchObject({
            'register': expect.any(Function)
        });

        expect(fs.readFileSync('./src/lib/core.js') + '').toMatch(/var set = function/);

    });

    it('Should register non-writable, non-enumerable and non-configurable members on just.', function () {

        expect(core).not.toHaveProperty('test');

        core.register('test', true);

        expect(Object.getOwnPropertyDescriptor(core, 'test')).toMatchObject({
            'configurable': false,
            'enumerable': false,
            'value': true,
            'writable': false
        });

    });

});
