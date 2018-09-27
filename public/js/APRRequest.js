APR.Define('APR.Request', APR).init(function () {
	
	'use strict';

	function APRRequest (method, url, headers, options) {

		var credentials;

		this.method = method.toUpperCase().trim();
		this.url = url;
		this.isAsync = true;

		if (!headers || typeof headers !== 'object') {
			headers = {};
		}

		if (!options || typeof options !== 'object') {
			options = {};
		}

		if (!options.credentials || typeof options.credentials !== 'object') {
			credentials = {
				'user' : null,
				'password' : null
			};
		}

		if ('XDomainRequest' in window && options.withCredentials) {
			
			this.xdr = new XDomainRequest();
			this.xdr.open(this.method, this.url);
			
			if (headers) {
				APR.Logger.logInformation('Custom headers are not being set. XDR does not admit that.');
			}

			return this;
		}

		this.xhr = new XMLHttpRequest();
		this.xhr.open(this.method, this.url, this.isAsync, credentials.user, credentials.password);

		if (options.withCredentials) {
			this.xhr.withCredentials = true;
		}

		APR.eachProperty({
			'X-Requested-With' : 'XMLHttpRequest',
			'Content-Type' : 'application/json; charset=UTF-8'
		}, function setDefaultHeaders (v, k) {

			if (!(k in headers) && !(k.toLowerCase() in headers)) {
				headers[k] = v;
			}

		});

		this.setHeaders(headers);

		return this;
	
	}

	APRRequest.prototype.setHeaders = function setRequestHeaders (headers, doNotRemoveEmptyOnes) {

		if (typeof headers !== 'object') {
			throw new TypeError("\"" + headers + "\" is not an object.");
		}

		if (this.xdr) {
			throw new Error("Custom headers aren't permitted in a XDR object.");
		}

		APR.eachProperty.call(this.xhr, headers, function (value, key) {
			
			if (headers[key] === '' && !doNotRemoveEmptyOnes) {
				return;
			}
			
			this.setRequestHeader(key, value);

		});

		return this;
	
	};

	APRRequest.prototype.sendSync = function (data) {

		var xhr, xdr;

		if (navigator.sendBeacon && this.method === 'POST') {
			navigator.sendBeacon(this.url, JSON.stringify(data));
			return;
		}

		if ((xhr = this.xhr)) {
			xhr.abort();
			xhr = new XMLHttpRequest();
			xhr.open(this.method, this.url, false);
			xhr.setHeaders({
				'Content-Type' : 'text/plain; charset=UTF-8'
			});
		}
		else if ((xdr = this.xdr)) {} // (?)

		(xhr || xdr).send(data);

	};

	APRRequest.prototype.send = function sendRequest (data, callback) {

		var _this = this;
		var isCallbackAFunction = typeof callback === 'function';
		var onSuccess = function () {
			
			var response;

			try {
				response = JSON.parse(this.responseText);
			}
			catch (e) {
				response = this.responseText;
			}

			if (isCallbackAFunction) {
				callback(false, response);
			}

		};
		var onError = function () {

			APR.Logger.log("There was an error in the request to \"" + _this.url + "\". (The status code was " + this.status + ").");
			
			if (isCallbackAFunction) {
				callback(true);
			}

		};
		var onReadyStateChange = function onReadyStateChange () {

			if (this.readyState !== XMLHttpRequest.DONE) {
				return;
			}

			if (this.status < 200 || this.status >= 400) {
				onError.call(this);
			}

			if (this.status >= 200 && this.status < 400) {
				onSuccess.call(this);
			}

		};
		var xhr = this.xhr;

		if (this.method === 'GET' && data) {
			this.url += '?' + APRRequest.getObjectAsURLString(data);
			data = null;
		}

		if (data && typeof data === 'object') {
			data = JSON.stringify(data);
		}

		if (this.xdr) {
			
			return (function ie8 (xdr) {
				
				xdr.onload = onSuccess;
				xdr.ontimeout = onError;
				xdr.onerror = onError;
				setTimeout(function () {
					xdr.send();
				}, 0);

			})(this.xdr);

		}

		xhr.onreadystatechange = onReadyStateChange;
		xhr.send(data || null);

	};

	APRRequest.post = function makePOSTRequest (url, data, callback) {
		new APRRequest('POST', url).send(data, callback);
	};

	APRRequest.get = function makeGETRequest (url, data, callback) {
		new APRRequest('GET', url).send(data, callback);
	};

	APRRequest.getObjectAsURLString = function getObjectAsURLString (data) {
	
		var urlString = '';

		APR.eachProperty(data, function (value, key) {
			urlString += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
		});

		return urlString.slice(0, -1);

	};

	APRRequest.getURLParamsAsObject = function getURLParamsAsObject (url) {

		var params = url.split('?')[1];
		var paramsAsObject = {};

		if (!params) {
			return null;
		}

		APR.eachElement(params.split('&'), function (param) {
			
			var parts = param.split('=');
			var key = decodeURIComponent(parts[0]);
			var value = decodeURIComponent(parts[1]);

			paramsAsObject[key] = value;

		});

		return paramsAsObject;

	};

	if (!APR.Request) {
		APR.Request = APRRequest;
	}

})();