var test = require('tape');
var APRLocalStorage = require('../../src/lib/APRLocalStorage');

test('/lib/APRLocalStorage.js', function (t) {

    var cookiesAreEnabled = APRLocalStorage(true).isStorageAvailable('cookies');
    var passIfCookiesAreDisabled = function (t) {

        // TODO: Mock
        if (!cookiesAreEnabled) {

            t.pass('Cookies are disabled.');
            t.end();

            return true;

        }

        return false;

    };

    t.test('Should set a consent.', function (st) {

        var a,
            b,
            c,
            d;

        st.is(APRLocalStorage() instanceof APRLocalStorage, true);

        a = APRLocalStorage(true);
        st.is(a.consent, true);
        st.is(a.isExplicit, true);

        b = APRLocalStorage();
        st.is(b.consent, false, 'Defaults to false.');
        st.is(b.isExplicit, false, 'Defaults to false.');

        c = APRLocalStorage(null);
        st.is(c.consent, false, 'Values are converted to booleans.');
        st.is(c.isExplicit, true, 'consent is not `undefined`, so true is expected.');

        d = APRLocalStorage(null, false);
        st.is(d.consent, false);
        st.is(d.isExplicit, false);

        st.end();

    });

    t.test('Should check if a cookie exists.', function (st) {

        if (passIfCookiesAreDisabled(st)) { return; }

        document.cookie = 'a=b;';

        st.is(APRLocalStorage.cookieExists('a'), true);
        st.is(APRLocalStorage.cookieExists('b'), false);
        st.is(APRLocalStorage.cookieExists('a=b'), true);
        st.is(APRLocalStorage.cookieExists('a=d'), false);

        st.end();

    });

    t.test('Should get a cookie.', function (st) {

        if (passIfCookiesAreDisabled(st)) { return; }

        document.cookie = 'a=b;';

        st.is(APRLocalStorage.getCookie('a'), 'b');
        st.is(APRLocalStorage.getCookie('b'), null);
        st.is(APRLocalStorage.getCookie('a=b'), null);

        if (!passIfCookiesAreDisabled(st)) {

            document.cookie = 'a=;';
            st.is(APRLocalStorage.getCookie('a'), '',
                'Should return an empty string when a cookie doesn\'t exist.');

        }

        st.end();

    });

    t.test('Should return the DoNotTrack header in a common format.', function (st) {

        st.is(/boolean|undefined/.test(typeof APRLocalStorage.DNT), true);
        st.end();

    });

    t.test('Should NOT use the local storage.', function (st) {

        var aprLocalStorage = APRLocalStorage(false);

        st.test('Should NOT set a cookie.', function (sst) {

            if (passIfCookiesAreDisabled(sst)) { return; }

            document.cookie = 'a=; expires=' + new Date(0).toGMTString();

            sst.is(aprLocalStorage.setCookie('a', 'b'), false);
            sst.is(APRLocalStorage.cookieExists('a=b'), false);

            sst.end();

        });

        st.test('Should NOT remove a cookie.', function (sst) {

            if (passIfCookiesAreDisabled(sst)) { return; }

            document.cookie = 'a=b;';

            sst.is(aprLocalStorage.removeCookie('a'), false);
            sst.is(APRLocalStorage.cookieExists('a'), true);

            sst.end();

        });

        st.test('Should return instantly and don\'t test anything.', function (
            sst) {

            sst.is(aprLocalStorage.isStorageAvailable('localStorage'),
                false, 'Testing with dumb data is not allowed.');

            sst.end();

        });

        st.end();

    });

    t.test('Should use the local storage.', function (st) {

        var aprLocalStorage = APRLocalStorage(true);

        /** @TODO: Mock */
        st.test('Should allow to change what\'s being saved in ' +
            'isStorageAvailable()', function (sst) {

            sst.is(typeof aprLocalStorage.isStorageAvailable('cookies', 'k'), 'boolean');
            sst.is(typeof aprLocalStorage.isStorageAvailable('cookies', 'k', 'v'), 'boolean');
            sst.end();

        });

        /** @TODO: Mock */
        st.test('Should check if the storage exists and it\'s allowed to ' +
            'use it.', function (sst) {

            var testAvailability = function (storageType) {

                var storage = window[storageType];
                var k = 'a';
                var v = 'b';

                sst.is(typeof aprLocalStorage.isStorageAvailable(storageType, k, v),
                    'boolean', 'Should save a temporary value and remove it afterwards');

                if (storageType === 'cookies') {

                    if (APRLocalStorage.getCookie(k) === v) {

                        sst.fail('The cookie wasn\'t removed.');

                    }

                }
                else if (storage.getItem(k) === v) {

                    sst.fail('The temporary value added to ' + storageType +
					' wasn\'t removed');

                }

            };

            testAvailability('cookies');
            testAvailability('localStorage');
            testAvailability('sessionStorage');

            sst.end();

        });

        st.test('Should allow checking any function.', function (sst) {

            var noop = function () {};
            var throwableFn = function () {

                throw new Error('My custom storage.');

            };

            window.myStorage = {
                'setItem': throwableFn
            };

            window.myStorage.removeItem = noop;
            sst.is(aprLocalStorage.isStorageAvailable('myStorage'), false,
                'Should return `false` if something fails.');

            window.myStorage.removeItem = throwableFn;
            sst.is(aprLocalStorage.isStorageAvailable('myStorage'), false,
                'Should return `false` if `removeItem()` throws.');

            delete window.myStorage;

            sst.end();

        });

        st.test('Should set a cookie.', function (sst) {

            if (passIfCookiesAreDisabled(sst)) { return; }

            document.cookie = 'a=; expires=' + new Date(0).toGMTString();

            sst.is(aprLocalStorage.setCookie('a', 'b'), true);
            sst.is(APRLocalStorage.cookieExists('a=b'), true);

            sst.end();

        });

        st.test('Should remove a cookie.', function (sst) {

            if (passIfCookiesAreDisabled(sst)) { return; }

            document.cookie = 'a=b;';

            sst.is(aprLocalStorage.removeCookie('a'), true);
            sst.is(APRLocalStorage.cookieExists('a'), false);
            sst.is(aprLocalStorage.removeCookie('a'), true,
                'When the cookie does not exist, `true` is returned.');

            sst.end();

        });

        st.end();

    });

    t.end();

});
