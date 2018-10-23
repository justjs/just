APR.Define('APR/Request').using(function () {
	
	'use strict';

	var _ = APR.createPrivateKey({
		'listen' : function (eventName, handler) {

			if (typeof handler === 'function') {
				throw new TypeError(handler + ' must be a function.');
			}

			this.listeners = APR.defaults(this.listeners, {});
			this.listeners[eventName] = handler;

		},
		'getListener' : function (eventName) {
			return this.listeners[eventName];
		},
		'cloneRequest' : function (newFields) {

			var newRequest = new APRRequest(
				newFields.method || this.public.method,
				newFields.url || this.public.url,
				newFields.options || this.options
			);

			_(newRequest).listeners = this.listeners;
			_(newRequest).headers = this.headers;
			
			return newRequest;

		},
		'abort' : function () {
			(this.xhr || this.xdr).abort();
		}
	}, {
		'getResponse' : function getJSONResponse (xhrLike) {

			var response;

			try {
				response = JSON.parse(xhrLike.responseText);
			}
			catch (e) {
				response = xhrLike.responseText;
			}
			
			return response;

		}
	});

	function APRRequest (method, url, options) {

		var _this = _(this);
		var withCredentials;

		if (!(this instanceof APRRequest)) {
			return new APRRequest(method, url, options);
		}

		_(this).public = this;

		this.method = String(method).trim();
		this.url = url;
		this.options = Object.assign({}, APRRequest.DEFAULT_OPTIONS, APR.defaults(options, {}));
		
		withCredentials = !APR.isObjectEmpty(options.credentials);

		if (withCredentials && 'XDomainRequest' in window) {
			
			_this.xdr = new XDomainRequest();
			_this.xdr.open(this.method, this.url);
			// Custom headers are not being set. XDR does not admit that.
			
			return this;

		}

		_this.xhr = new XMLHttpRequest();
		_this.xhr.open(
			this.method,
			this.url,
			this.options.async,
			this.options.credentials.user,
			this.options.credentials.password
		);
		_this.xhr.withCredentials = withCredentials;

		this.setHeaders(options.headers);

	}

	Object.assign(APRRequest, {
		'DEFAULT_OPTIONS' : {
			'async' : true,
			'credentials' : {},
			'headers' : {
				'X-Requested-With' : 'XMLHttpRequest',
				'Content-Type' : 'application/json; charset=UTF-8'
			}
		},
		'addDataToUrl' : function (url, data) {

			var newUrl = url + (APR.parseUrl(url).search
				? (url.endsWith('?') ? '' : '?')
				: (url.endsWith('&') ? '' : '&')
			);

			APR.eachProperty(data, function (key, value) {
				newUrl += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
			});

			return newUrl.slice(0, -1);

		}
	});

	Object.assign(APRRequest.prototype, {
		'onSuccess' : function (handler) {
			return _(this).listen('onSuccess', handler), this;
		},
		'onError' : function (handler) {
			return _(this).listen('onError', handler), this;
		},
		'modify' : function (handler) {
			return _(this).listen('beforeSend', handler), this;
		},
		'setHeaders' : function (headers) {

			if (!APR.isKeyValueObject(headers)) {
				throw new TypeError(headers + ' must be a key-value object.');
			}

			_(this).headers = APR.defaults(_(this).headers, {});

			APR.eachProperty(headers, function setHeaders (value, key) {
				_(this).headers[key] = value;
				_(this).xhr.setRequestHeaders(key, value);
			}, this);

			return this;

		},
		'send' : function (data) {

			var _this = _(this);
			var onSuccess = function () {
				_this.getListener('onSuccess').call(this, _.getResponse(this));
			}, onError = function () {
				_this.getListener('onError').call(this, _.getResponse(this));
			};

			if (APR.isKeyValueObject(data)) {
				data = JSON.stringify(data);
			}

			if (!data) {
				data = null;
			}
			else if (/GET/i.test(this.method)) {
				_this.abort();
				_this = _(this.cloneRequest({'url' : APRRequest.addDataToUrl(this.url, data)}));
				data = null;
			}

			_this.xhr.onreadystatechange = function () {

				var response;

				if (this.readyState !== XMLHttpRequest.DONE) {
					return;
				}

				if (this.status < 200 || this.status >= 400) {
					onSuccess.call(this);
				}

				if (this.status >= 200 && this.status < 400) {
					onError.call(this);
				}

			};

			if (_this.xdr) {

				return (function ie8 (xdr) {

					xdr.onload = onSuccess;
					xdr.ontimeout = onError;
					xdr.onerror = onError;
					
					if (_this.beforeSend) {
						_this.beforeSend.call(xdr);
					}

					setTimeout(function () {
						xdr.send(data);
					}, 0);

				})(_this.xdr), this;

			}

			if (_this.beforeSend) {
				_this.beforeSend.call(_this.xhr);
			}

			_this.xhr.send(data);

			return this;

		},
		'sendBeacon' : function (data) {

			if (navigator.sendBeacon && this.method === 'POST') {
				return navigator.sendBeacon(this.url, JSON.stringify(data)), this;
			}

			_this.abort();

			new APRRequest(this.method, this.url, Object.assign(this.options, {'async' : false})).setHeaders({
				'Content-Type' : 'text/plain; charset=UTF-8'
			}).send(data);

			return this;

		}
	});

	if (!APR.Request) {
		APR.Request = APRRequest;
	}

})();