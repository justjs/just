var env = process.env;
var NODE_ENV = env.NODE_ENV;
var npmPackageVersion = env.npm_package_version;
var production = NODE_ENV === 'production';
var development = NODE_ENV === 'development';

module.exports = {
    'render': {
        'context': {
            'env': NODE_ENV,
            'production': production,
            'development': development,
            'version': (production
                ? npmPackageVersion
                : 'x.x.x'
            )
        }
    }
};
