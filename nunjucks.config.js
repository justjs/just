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

    const {stdout} = spawnSync('npm run build', []);

    return `${stdout}`;

}

function generateHash (filename) {

    const {stdout} = spawnSync(path.resolve('bin/generate-sri'), [filename]);

    return `${stdout}`;

}

module.exports = {
    'render': {
        'context': {
            'env': NODE_ENV,
            'production': production,
            'development': development,
            'version': (production
                ? npmPackageVersion
                : 'x.x.x'
            ),
            'getIntegrity': function (src) {

                var filename = src;
                var hash;

                if (!fs.existsSync(filename)) { build(); }

                hash = generateHash(filename);

                return hash;

            }
        }
    }
};
