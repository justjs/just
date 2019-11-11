var path = require('path');

module.exports = {
    'mode': 'production',
    'devtool': 'inline-source-map',
    'entry': {
        'non-versioned': './docs/static/non-versioned/js/index.js'
    },
    'devServer': {
        'contentBase': path.join(__dirname, 'public'),
        'compress': true,
        'port': 9000
    }
};
