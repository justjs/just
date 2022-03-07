/* globals Promise */
/**
 * This test checks if raw scripts shown in the docs
 * are fully working by inserting them on a page.
 *
 * This makes sure [integrity] values are working, and [src]
 * values are set to a CDN url.
 */
(function () {

    'use strict';

    var el = function (selector) { return [].slice.call(document.querySelectorAll(selector)); };
    var rawScripts = el('#browser-setup code').map(function (element) { return element.textContent; });
    var loadScript = function (rawScript) {

        var container = document.body;

        return new Promise(function (resolve, reject) {

            // Raw scripts won't be executed by using .innerHTML. That's why we create a Node instead.
            var script = document.createElement('script');
            var attributes = rawScript.match(/\w+="[^"]*"/g);

            attributes.forEach(function (attribute) {

                var parts = attribute.split('=');
                var name = parts[0];
                var value = parts[1].slice(1, -1); // Remove quotes.

                if (name === 'src') {

                    // Instead of making an external request, check the file locally.
                    value = value.replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/@just-js\/just@([^/]+)\/(.+)/, '$2');

                }

                this.setAttribute(name, value);

            }, script);

            script.onload = function () {

                if ('just' in window) { resolve(); }
                else { reject(new Error('`just` is not defined.')); }

            };
            script.onerror = function (e) { reject(e); };

            container.appendChild(script);

        });

    };

    window.karmaCustomEnv = {
        'execute': function (karma) {

            if (!rawScripts.length) {

                return karma.result({
                    'success': false,
                    'suite': [],
                    'log': [new Error('Scripts are not being shown.')]
                });

            }

            Promise
                .all(rawScripts.map(loadScript))
                .then(function () {

                    karma.result({
                        'success': true
                    });

                })
                .catch(function (e) {

                    karma.result({
                        'success': false,
                        'suite': [],
                        'log': [e]
                    });

                })
                .finally(function () {

                    karma.complete({});

                });

        }
    };

})();
