var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var spawnSync = childProcess.spawnSync;
var env = process.env;
var NODE_ENV = env.NODE_ENV;
var npmPackageVersion = env.npm_package_version;
var production = NODE_ENV === 'production';
var development = NODE_ENV === 'development';

function build () {

    var cmd = spawnSync('npm run build', []);
    var stdout = cmd.stdout;

    return stdout.toString();

}

function generateHash (filename) {

    var cmd = spawnSync(path.resolve('bin/generate-sri'), [filename]);
    var stdout = cmd.stdout;

    return stdout.toString().trim();

}

function getCDNUrl (filename, version) {

    return 'https://cdn.jsdelivr.net/npm/@just-js/just@' + version + '/' + filename;

}

function getIntegrity (filename) {

    var hash;

    if (!fs.existsSync(filename)) { build(); }

    hash = generateHash(filename);

    return hash;

}

function buildTag (tagName, attributes, content) {

    var attributesString = Object.keys(attributes).reduce(function (string, name) {

        var value = attributes[name];

        string += ' ' + name + '="' + value + '"';

        return string;

    }, '');

    return '<' + tagName + attributesString + '>' + (content || '') + '</' + tagName + '>';

}

function buildScriptTag (filename, version) {

    return buildTag('script', {
        'src': getCDNUrl(filename, version),
        'crossorigin': 'anonymous',
        'integrity': getIntegrity(filename),
        'defer': ''
    });

}

function getAvailableVersions () {

    var cmd = spawnSync(path.resolve('bin/get-available-versions'), []);
    var stdout = cmd.stdout;

    return stdout.toString().trim().split(' ');

}

module.exports = {
    'render': {
        'context': {
            'env': NODE_ENV,
            'production': production,
            'development': development,
            'version': npmPackageVersion,
            'getIntegrity': getIntegrity,
            'getCDNUrl': getCDNUrl,
            'buildScriptTag': buildScriptTag,
            'getAvailableVersions': getAvailableVersions
        }
    }
};
