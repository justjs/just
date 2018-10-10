APR.Define('APR/Template').using(function () {

	'use strict';

	var ArrayProto = Array.prototype;
	var _ = Object.assign(APR.createPrivateKeys(), {
		'getRandomString' : function () { // https://gist.github.com/6174/6062387
			return Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 15);
		},
		'getTabsCount' : function (string) {
			return APR.get((string + '').match(/\t/g), []).length;
		}
	});

	function APRTemplate (tokens, template) {

		if (!APR.is(this, APRTemplate)) {
			return new APRTemplate(tokens);
		}
			
		if (!_(this).definitions) {
			_(this).definitions = {};
		}

		if (this.constructor === APRTemplate) {
			this.tokens = APR.get(tokens, {'id' : tokens});
			this.length = ArrayProto.push.apply(this, APR.get(template, [template]));
		}

	}

	Object.assign(APRTemplate.prototype, {

		'onDataReceived' : function (handler) {

			if (!APR.is(handler, 'function')) {
				throw new TypeError(handler + ' must be a function.');
			}

			_(this).onDataReceived = handler;

			return this;

		},
		'addData' : function (data) {
			
			_(this).data = data;

			if (_(this).onDataReceived) {
				_(this).onDataReceived.call(this, data);
			}

			return this;

		},
		'define' : function (definitions) {

			if (!APR.is(definitions, {})) {
				throw new TypeError(definitions + ' must be a key-value object.');
			}

			APR.eachProperty(Object.assign(_(this).definitions, definitions), function (definition, key) {

				ArrayProto.forEach.call(this, function (object, i) {

					var value;

					if (!APR.is(object, {})) {
						return;
					}

					value = object[key];

					this[i] = (APR.is(definition, 'function')
						? definition.apply(object, APR.get(value, [value]))
						: value
					);

				}, this);

			}, this);

			return this;

		},
		'parse' : function () {
				
			var tokens = this.tokens;
			var data = _(this).data;
			var deferredObjects = {};
			var usedTabs = [];
			var parent = document.createElement('div');
			var currentBranch = parent;
			var previousBranch;

			APR.eachElement(this, function toString (element) {

				var uid;

				if (APR.is(element, 'string')) {

					return element.replace(/\{this\.([^\}]+)\}/ig, function props (exp, property) {
						return APR.access(tokens, property);
					}).replace(/\{([^\}]+)\}/g, function vars (exp, property) {
						return APR.access(data, property);
					});

				}

				uid = _.getRandomString();

				while (APR.is(element, 'function')) {
					element = element.call(this);
				}

				if (APR.is(element, {})) {
					throw new TypeError(Object.keys(element) + ' were not defined.');
				}

				if (APR.is(element, [])) {
					element = new APRTemplate(tokens, element)
						.onDataReceived(_(this).onDataReceived)
						.define(_(this).definitions)
						.addData(data);
				}

				if (APR.is(element, APRTemplate)) {
					element = element.get();
				}

				if (!APR.is(element, Node, Element)) {
					element = document.createTextNode(element);
				}

				deferredObjects[uid] = element;

				return uid;

			}).forEach(function (string, i, array) {

				var previousTabs = _.getTabsCount(array[i - 1]);
				var currentTabs = _.getTabsCount(string);

				string = string.replace(/\t/g, '');

				if (currentTabs > previousTabs) {
					previousBranch = currentBranch;
					usedTabs[currentTabs] = currentTabs;
				}
				else {

					while (currentTabs < previousTabs && previousBranch.parentNode) {
					
						while (!(--previousTabs in usedTabs) && previousTabs >= 0);
						
						if (previousTabs in usedTabs) {
							usedTabs.splice(previousTabs, 1);
						}

						previousBranch = previousBranch.parentNode;
					
					}

				}

				if (!previousBranch) {
					previousBranch = parent;
				}

				if (currentBranch = deferredObjects[string]) {
					delete deferredObjects[string];
				}

				currentBranch = currentBranch || APRElement.createElement(string);
				previousBranch.appendChild(currentBranch);

			}, this);

			return parent.children;

		}
	});

	if (APR.Template) {
		APR.Template = APRTemplate;
	}

});