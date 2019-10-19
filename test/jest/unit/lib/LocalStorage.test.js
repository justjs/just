var LocalStorage = require('@lib/LocalStorage');
var isLocalStorageAvailable = true;
var stores = {
    'cookies': {},
    'localStorage': {}
};
var mocks = {};

beforeAll(function () {

    mocks.localStorage = jest.spyOn(window, 'localStorage', 'get').mockImplementation(function () {

        var store = stores.localStorage;

        return {
            'setItem': function (key, value) { if (isLocalStorageAvailable) { store[key] = value; } },
            'getItem': function (key) { return store[key]; }
        };

    });
    mocks.setCookie = jest.spyOn(document, 'cookie', 'set').mockImplementation(function (cookie) {

        var parts = cookie.split(/^([^=]+)=([^;]*)/);
        var name = parts[1];
        var value = parts[2];
        var store = stores.cookies;
        var expires = cookie.split(/expires=([^;]*)/)[1];
        var maxAge = +cookie.split(/max-age=([^;]*)/)[1];
        var currentDate = new Date(new Date().toGMTString());

        if (!isNaN(maxAge)) {

            expires = new Date(currentDate).setSeconds(maxAge);

        }

        if (isLocalStorageAvailable) {

            store[name] = {
                'value': value,
                'expires': new Date(expires),
                'raw': cookie
            };

        }

    });
    mocks.getCookie = jest.spyOn(document, 'cookie', 'get').mockImplementation(function () {

        var store = stores.cookies;

        return Object.keys(store).map(function (key) {

            var cookie = store[key];
            var value = cookie.value;
            var expires = cookie.expires;
            var currentDate = new Date(new Date().toGMTString());

            if (expires <= currentDate) { return; }

            return key + '=' + value;

        }).filter(function (v) { return v; }).join(';');

    });

});

describe('@lib/LocalStorage.js', function () {

    it('Should set a consent.', function () {

        var explicit, defaultValues, invalid, explicitFalse;

        expect(LocalStorage()).toBeInstanceOf(LocalStorage);

        explicit = LocalStorage(true);
        expect(explicit.consent).toBe(true);
        expect(explicit.isExplicit).toBe(true);

        defaultValues = LocalStorage();
        /** Defaults to false. */
        expect(defaultValues.consent).toBe(false);
        /** Defaults to false. */
        expect(defaultValues.isExplicit).toBe(false);

        invalid = LocalStorage(null);
        /** Values are converted to booleans. */
        expect(invalid.consent).toBe(false);
        /** consent is not `undefined`, so true is expected. */
        expect(invalid.isExplicit).toBe(true);

        explicitFalse = LocalStorage(null, false);
        expect(explicitFalse.consent).toBe(false);
        expect(explicitFalse.isExplicit).toBe(false);

    });

    it('Should check if a cookie exists.', function () {

        document.cookie = 'a=b;';

        expect(LocalStorage.cookieExists('a')).toBe(true);
        expect(LocalStorage.cookieExists('b')).toBe(false);
        expect(LocalStorage.cookieExists('a=b')).toBe(true);
        expect(LocalStorage.cookieExists('a=d')).toBe(false);

    });

    it('Should get a cookie.', function () {

        document.cookie = 'a=b;';

        expect(LocalStorage.getCookie('a')).toBe('b');
        expect(LocalStorage.getCookie('b')).toBeNull();
        expect(LocalStorage.getCookie('a=b')).toBeNull();

        document.cookie = 'a=;';
        /** Should return an empty string when a cookie doesn\'t exist. */
        expect(LocalStorage.getCookie('a')).toBe('');

    });

    it('Should return the DoNotTrack header in a common format.', function () {

        expect(typeof LocalStorage.DNT).toMatch(/boolean|undefined/);

    });

    describe('Should NOT use the local storage.', function () {

        var aprLocalStorage = LocalStorage(false);

        isLocalStorageAvailable = false;

        it('Should NOT set a cookie.', function () {

            document.cookie = 'a=; expires=' + new Date(0).toGMTString();

            expect(aprLocalStorage.setCookie('a', 'b')).toBe(false);
            expect(LocalStorage.cookieExists('a=b')).toBe(false);

        });

        it('Should NOT remove a cookie.', function () {

            document.cookie = 'a=b;';

            expect(aprLocalStorage.removeCookie('a')).toBe(false);
            expect(LocalStorage.cookieExists('a')).toBe(true);

        });

        it('Should return instantly and don\'t test anything.', function () {

            /* Testing with dumb data is not allowed. */
            expect(aprLocalStorage.isStorageAvailable('localStorage')).toBe(false);

        });

    });

    describe('Should use the local storage.', function () {

        var aprLocalStorage = LocalStorage(true);

        isLocalStorageAvailable = true;

        /** @TODO: Mock */
        it('Should allow to change what\'s being saved in ' +
            'isStorageAvailable()', function () {

            expect(typeof aprLocalStorage.isStorageAvailable('cookies', 'k'))
                .toBe('boolean');
            expect(typeof aprLocalStorage.isStorageAvailable('cookies', 'k', 'v'))
                .toBe('boolean');

        });

        /** @TODO: Mock */
        it('Should check if the storage exists and it\'s allowed to ' +
            'use it.', function () {

            var fail = jest.fn();
            var testAvailability = function (storageType) {

                var storage = window[storageType];
                var k = 'a';
                var v = 'b';

                /** Should save a temporary value and remove it afterwards. */
                expect(typeof aprLocalStorage.isStorageAvailable(storageType, k, v))
                    .toBe('boolean');

                if (storageType === 'cookies') {

                    if (LocalStorage.getCookie(k) === v) {

                        fail('The cookie wasn\'t removed.');

                    }

                }
                else if (storage.getItem(k) === v) {

                    fail('The temporary value added to ' + storageType +
					' wasn\'t removed');

                }

            };

            expect(fail).not.toHaveBeenCalled();

            testAvailability('cookies');
            testAvailability('localStorage');
            // testAvailability('sessionStorage');

        });

        it('Should allow checking any function.', function () {

            var noop = function () {};
            var throwableFn = function () {

                throw new Error('My custom storage.');

            };

            window.myStorage = {
                'setItem': throwableFn
            };

            window.myStorage.removeItem = noop;
            /** Should return `false` if something fails. */
            expect(aprLocalStorage.isStorageAvailable('myStorage')).toBe(false);

            window.myStorage.removeItem = throwableFn;
            /* Should return `false` if `removeItem()` throws. */
            expect(aprLocalStorage.isStorageAvailable('myStorage')).toBe(false);

            delete window.myStorage;

        });

        it('Should set a cookie.', function () {

            document.cookie = 'a=; expires=' + new Date(0).toGMTString();

            expect(aprLocalStorage.setCookie('a', 'b')).toBe(true);
            expect(LocalStorage.cookieExists('a=b')).toBe(true);

        });

        it('Should remove a cookie.', function () {

            document.cookie = 'a=b;';

            expect(aprLocalStorage.removeCookie('a')).toBe(true);
            expect(LocalStorage.cookieExists('a')).toBe(false);
            /** When the cookie does not exist, `true` is returned. */
            expect(aprLocalStorage.removeCookie('a')).toBe(true);

        });

    });

});

afterAll(function () {

    Object.keys(mocks).forEach(function (key) { mocks[key].mockRestore(); });

});
