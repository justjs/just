var cssNano = require('cssnano');
var autoprefixer = require('autoprefixer');

module.exports = {
    'plugins': [
        autoprefixer('since 2010'),
        cssNano({
            'preset': 'default'
        })
    ]
};
