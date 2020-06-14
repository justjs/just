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
            });

        beforeAll(function () { server.install(global); });
        afterAll(function () { server.remove(global); });

        it('Should make a GET request.', function (done) {

            var url = '/';

            request(url, function (error, response) {

                expect(this).toBeInstanceOf(XMLHttpRequest);
                expect(error).toBe(null);
                expect(response).toBe('');
                expect(this.status).toBe(204);

                done();

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
            ['400'],
            ['0', 'not'],
            ['199']
        ], 'Should %%%srespond with an error.', function (status, negation) {

            var url = status;

            request(url, function (error) {

                if (negation) { expect(error).toBe(null); }
                else { expect(error).toBeInstanceOf(Error); }

            });

        });

    });

});
