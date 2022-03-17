(function () {

    'use strict';

    var el = function (selector, container) { return (container || document).querySelectorAll(selector); };
    var versions = el('#versions')[0];
    var location = window.location;

    versions.addEventListener('change', function (e) {

        var version = this.value;
        var pathname = location.pathname;
        /**
         * Versions below 1.1.0 generated documentation
         * in /{browser,server}/index.html.
         *
         * Starting from version 1.1.0, documentation is generated
         * under /browser/{core,just}/index.html and server/index.html.
         */
        var newUrl = (/^1\.[01]\./.test(version)
            // Redirect to the full version.
            ? pathname.replace(/(browser)\/just/, '$1')
            // Use as it is.
            : pathname
        ).replace(/v[^\/]+/, 'v' + version);

        location.href = newUrl;

    });

})();
