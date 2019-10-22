var fs = require('fs');
var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var bundleFilepathsRelativeToRoot = [
    'dist/server/just.js',
    'dist/server/just.min.js',
    'dist/browser/just.js',
    'dist/browser/just.min.js'
];
var bundles = bundleFilepathsRelativeToRoot.map(
    function (filepath) { return require('@' + filepath); }
);

describe('Bundles', function () {

    test.each(bundles)('Should export an object called "just".', function (bundle) {

        expect(bundle).toHaveProperty('just');

    });

    test.each(bundles)('Should contain the current version (' + pkg.version + ').', function (bundle) {

        expect(bundle.just).toHaveProperty('version', pkg.version);

    });

    test.each(bundles)('Should not contain a reference to itself.', function (bundle) {

        expect(bundle.just).not.toHaveProperty('just');

    });

    test.each(bundleFilepathsRelativeToRoot)('Should contain a license.', function (filepath) {

        var file = fs.readFileSync(filepath) + '';

        expect(file).toMatch(/^\/\*\*[^*]+\* @license/);

    });

    test.each(bundleFilepathsRelativeToRoot)('Should export an umd module.', function (filepath) {

        var file = fs.readFileSync(filepath) + '';

        expect(file).toMatch(/define\(['"]just['"]/);
        expect(file).toMatch(/(module\.exports|exports)?\.just\s*=/);
        expect(file).toMatch(/this\.just\s*=/);

    });

});
