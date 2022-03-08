(function () {

    'use strict';

    var el = function (selector, container) { return (container || document).querySelectorAll(selector); };
    var versions = el('#versions')[0];
    var location = window.location;

    versions.addEventListener('change', function (e) {

        var version = this.value;

        location.href = '/v' + version + '/browser/';

    });

})();
