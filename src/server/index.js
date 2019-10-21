define([
    '../lib/access',
    '../lib/check',
    '../lib/defaults',
    '../lib/defineProperties',
    '../lib/defineProperty',
    '../lib/eachProperty',
    '../lib/isEmptyObject',
    '../lib/parseUrl',
    '../lib/stringToJSON',
    '../lib/toObjectLiteral'
], function (
    access,
    check,
    defaults,
    defineProperties,
    defineProperty,
    eachProperty,
    isEmptyObject,
    parseUrl,
    stringToJSON,
    toObjectLiteral
) {

    return {
        'access': access,
        'check': check,
        'defaults': defaults,
        'defineProperties': defineProperties,
        'defineProperty': defineProperty,
        'eachProperty': eachProperty,
        'isEmptyObject': isEmptyObject,
        'parseUrl': parseUrl,
        'stringToJSON': stringToJSON,
        'toObjectLiteral': toObjectLiteral
    };

});
