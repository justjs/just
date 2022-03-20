(function () {

    'use strict';

    var el = function (selector, container) { return (container || document).querySelectorAll(selector); };
    /**
     * Versions below 1.1.0 generated documentation
     * in /{browser,server}/index.html.
     *
     * Starting from version 1.1.0, documentation is generated
     * under /browser/{core,just}/index.html and server/index.html.
     */
    var isVersionBelow1Dot2 = function (version) { return /^1\.[01]\./.test(version) && !/\-dev/.test(version); };
    var versions = el('#versions')[0];
    var bundles = el('#bundles')[0];
    var location = window.location;
    var urlParts = location.pathname.match(/\/v([^.]+\.[^.]\.[^\/]+)\/(browser(?:\/(core|just))|server)\//) || [];
    var activeVersion = urlParts[1];
    // Normalize browser/just -> browser
    var activeBundle = (urlParts[2] || '').replace('/just', '');

    versions.addEventListener('change', function (e) {

        var version = this.value;
        var pathname = location.pathname;
        var newUrl = (isVersionBelow1Dot2(version)
            // Redirect to the full version.
            ? pathname.replace(/(browser)\/(?:just|core)/, '$1')
            // Use as it is.
            : pathname
        ).replace(/v[^\/]+/, 'v' + version);

        location.href = newUrl;

    });

    if (bundles) {

        bundles.addEventListener('change', function (e) {

            var bundle = this.value;
            var pathname = location.pathname;
            var newUrl = pathname
                // This will redirect browser/ -> server/, browser/core -> server/core, or viceversa.
                .replace(/(?:browser\/(?:(?:just|core)\/)?|server\/)/, bundle + '/')
                // This will change (invalid) server/just/ & server/core/ -> server/
                .replace(/(server)\/(?:just|core)\//, '$1/');

            if (!isVersionBelow1Dot2(activeVersion)) {

                // This will normalize urls -> browser/just | browser/core
                newUrl = newUrl.replace(/(browser)\/((?:just|core)\/)?/, function ($0, $1, $2) {

                    return $1 + '/' + ($2 || 'just/');

                });

            }

            location.href = newUrl;

        });

    }

    [versions, bundles].filter(function (v) {

        return v;

    }).forEach(function (select) {

        var id = select.id;
        var options = el('option', select);
        var selected = (el('option[value="' + (id === 'versions'
            ? activeVersion
            : activeBundle
        ) + '"]') || [])[0];

        select.value = (selected
            ? selected.value
            : ''
        );

    });

})();
