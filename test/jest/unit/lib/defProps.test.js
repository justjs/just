var defProps = require('@lib/defProps');
var defineProperties = require('@lib/defineProperties');

describe('@lib/defProps.js', function () {

    it('Should be an alias of defineProperties.', function () {

        expect(defProps).toBe(defineProperties);

    });

});
