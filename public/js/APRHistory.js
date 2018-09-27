APR.Define('APR.History', APR).requires({
	'0.APR.Event' : APR.self.setFileUrl('APREvent', 'js');
}, function (APREvent) {

	'use strict';

	var history = window.history,
		location = window.location;

	function APRHistory () {

		if (!APR.is(this, APRHistory)) {
			return new APRHistory();
		}

		this.urls = {};

	}

	function _triggerIfMatch (url, route) {

		url = APR.parseUrl(url);

		if (APR.is(url.pathname + url.search + url.hash, route.url)) {
			route.listener(route);
		}

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
				_triggerIfMatch(url, route);
			});

		},
		'listen' : function listen (urls, listener) {

			APR.eachElement(APR.get(urls, [urls]), function () {

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

				this.urls[Object.keys(this.urls).length] = route;

				_triggerIfMatch(location.href, route);

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