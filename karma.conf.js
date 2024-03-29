/*
 * Karma configuration
 * Generated on Sun Mar 06 2022 09:04:39 UTC
 */

module.exports = function (config) {

    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        /*
         * frameworks to use
         * available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
         */
        frameworks: ['custom'],


        // list of files / patterns to load in the browser
        files: [
            {'pattern': 'dist/browser/**/*', 'included': false, 'serve': true, 'nocache': true},
            {'pattern': 'docs/public/index.html', 'included': true, 'type': 'dom', 'serve': false},
            'test/e2e/**/*.test.js'
        ],

        // Set cors headers just in case we need them for [integrity] values.
        customHeaders: [{
            'match': '/dist/',
            'name': 'Access-Control-Allow-Origin',
            'value': '*'
        }],

        proxies: {
            '/dist/': '/base/dist/'
        },

        // list of files / patterns to exclude
        exclude: [
        ],


        /*
         * preprocess matching files before serving them to the browser
         * available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
         */
        preprocessors: {
        },


        /*
         * test results reporter to use
         * possible values: 'dots', 'progress'
         * available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
         */
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        /*
         * level of logging
         * possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
         */
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        /*
         * start these browsers
         * available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
         *
         * Don't run jsdom as it doesn't seem to validate [integrity] values.
         * In fact, that's the main reason why we use karma instead of jest.
         */
        browsers: ['FirefoxHeadless'],


        /*
         * Continuous Integration mode
         * if true, Karma captures browsers, runs the tests and exits
         */
        singleRun: true,

        /*
         * Concurrency level
         * how many browser instances should be started simultaneously
         */
        concurrency: Infinity
    });

};
