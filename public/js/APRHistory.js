APR.Define('APR/History').using(function () {

	'use strict';

	var history = window.history,
		location = window.location;

	var _ = Object.assign(APR.createPrivateKey(), {
		'addListener' : function () {
			window.addEventListener();
		},
		'triggerIfMatch' : function (url, route) {

			url = APR.parseUrl(url);

			if (APR.is(url.pathname + url.search + url.hash, route.url)) {
				window.dispatchEvent(new CustomEvent());
				route.listener(route);
			}

		}
	});

	function APRHistory () {

		if (!APR.is(this, APRHistory)) {
			return new APRHistory();
		}

		_(this).urls = [];

	}

	Object.assign(APRHistory.prototype, {
		'changeState' : function changeState (action, url, options) {

			var title = (options = APR.get(options, {})).title;
			var state = options.state;
			var hashSufix = options.hashSufix || '!';
			var eventType = '';
			var isPush = APR.is(action, /^push$/i);
			var isReplace = APR.is(action, /^replace$/i);

			if (!isPush && !isReplace) {
				throw new TypeError('"' + action + '" is invalid or it\'s not implemented.');
			}

			if (isPush && history.pushState) {
				history.pushState(state, title, url);
				eventType = 'pushState';
			}
			else if (isReplace && history.replaceState) {
				history.replaceState(state, title, url);
				eventType = 'replaceState';
			}
			else {
				location.href = '#' + hashSufix + url;
				eventType = 'hashchange';
			}

			if (!APR.is(title, 'undefined') && document.title !== title) {
				setTitle(title);
			}

			APR.eachProperty(this.urls, function (route, _) {
				_.triggerIfMatch(url, route);
			});

		},
		'listen' : function listen (urls, listener) {

			APR.get(urls, [urls]).forEach(function (url) {

				var route = {
					'url' : url,
					'listener' : listener
				};

				if (!APR.is(listener, 'function')) {
					throw new TypeError('"' + listener + '" must be a function.');
				}

				if (APR.parseUrl(route.url).origin !== location.origin) {
					throw new TypeError('"' + route.url + '" must be in the same origin.');
				}

				_(this).urls.push(route);

				_.addListener();

				_.triggerIfMatch(location.href, route);

			});

		},
		'setTitle' : function setTitle (title) {
			document.title = title;
		}
	});

	if (!APR.History) {
		APR.History = new APRHistory();
	}

});

APR.body.addState('isActive', e, {
	'data' : true
});
APR.body.removeState('');
APR.body.toggleState('');
APR.body.listenState('isActive', function () {

});

APRState.pushState(this.href, e, {
	'data' : true
});
APRState.replaceState(this.href);
APRState.listenState(/\#/, function () {

});

APRState.changeState('replace');