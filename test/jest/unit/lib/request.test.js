var request = require('@lib/request');
var mockXMLHttpRequest = require('mock-xmlhttprequest');

describe('@lib/request.js', function () {

    it('Should make an XMLHttpRequest using the default values.', function () {

        var mockOpen = jest.fn();
        var mockSend = jest.fn();
        var mockSetRequestHeader = jest.fn();
        var mockXMLHttpRequest = jest
            .spyOn(window, 'XMLHttpRequest')
            .mockImplementation(function () {

                return {
                    'open': mockOpen,
                    'send': mockSend,
                    'setRequestHeader': mockSetRequestHeader
                };

            });
        var method = 'GET';
        var url = void 0;
        var async = true;
        var user = null;
        var password = null;

        request();

        expect(mockXMLHttpRequest).toHaveBeenCalledWith();
        expect(mockOpen).toHaveBeenCalledWith(method, url, async, user, password);
        expect(mockSetRequestHeader).toHaveBeenCalledWith('X-Requested-With', 'XMLHttpRequest');
        expect(mockSend).toHaveBeenCalledWith(null);

        jest.restoreAllMocks();

    });

    describe('.appendData()', function () {

        test.each([
            ['/', null, '/'],
            ['/', ['a', 'b'], '/?0=a&1=b'],
            ['/', {'a': 1, 'b': 2}, '/?a=1&b=2'],
            ['/?', {'a': 1, 'b': 2}, '/?a=1&b=2'],
            ['/?a=1', {'a': 1, 'b': 2}, '/?a=1&a=1&b=2'],
            ['/?a=1&b=2', {'c': 3}, '/?a=1&b=2&c=3']
        ])('Should append data to a given url.', function (url, data, expectedUrl) {

            expect(request.appendData(url, data)).toBe(location.origin + expectedUrl);

        });

    });

    describe('.dataToUrl()', function () {

        it('Should throw if the given value is not an object.', function () {

            var url = '/';
            var data = '';

            expect(function () {

                request.dataToUrl(url, data);

            }).toThrow(TypeError);

        });

    });

    describe('integration', function () {

        var server = mockXMLHttpRequest
            .newServer()
            .get('/', {
                'status': 204
            })
            .get('some.json', {
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body': '{"ok": true}'
            })
            .get('199', {
                'status': 199
            })
            .get('400', {
                'status': 400
            })
            .get('0', {
                'status': 0
            })
            .get('204', {
                'status': 204
            });

        beforeAll(function () { server.install(global); });
        afterAll(function () { server.remove(global); });

        it('Should make a request.', function () {

            var method = 'GET';
            var data = {};
            var send = function (data) {

                expect(this).toBeInstanceOf(XMLHttpRequest);
                expect(data).toBe(data);

            };
            var url = '/';

            request(url, function (error, response) {

                expect(this).toBeInstanceOf(XMLHttpRequest);
                expect(error).toBe(null);
                expect(response).toBe('');
                expect(this.status).toBe(204);

                expect.assertions(6);

            }, {
                'method': method,
                'data': data,
                'send': send
            });

        });

        it('Should request a json.', function (done) {

            var url = 'some.json';

            request(url, function (error, response) {

                expect(error).toBe(null);
                expect(response).toMatchObject({'ok': true});
                expect(this.responseType).toBe('json');
                // expect(this.requestHeaders['Content-Type']).toBe('application/json');

                done();

            });

        });

        test.each([
            ['400', ''],
            ['0', 'not'],
            ['199', ''],
            ['204', 'not']
        ])('Should %%srespond with an error.', function (status, negation, done) {

            var url = status;

            request(url, function (error) {

                if (negation) { expect(error).toBe(null); }
                else { expect(error).toBeInstanceOf(Error); }

                done();

            });

        });

    });

});
