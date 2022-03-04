var env = process.env;
var NODE_ENV = env.NODE_ENV;
var npmPackageVersion = env.npm_package_version;

module.exports = {
    'render': {
        'context': {
            'env': NODE_ENV,
            'production': NODE_ENV === 'production',
            'development': NODE_ENV === 'development',
            'version': npmPackageVersion
        }
    }
};
