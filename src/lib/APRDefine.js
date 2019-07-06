define('APRDefine', [
	'./core',
	'./access',
	'./eachProperty',
	'./loadElement',
	'./check',
	'./createPrivateKey',
	'./findElements',
	'./stringToJSON',
	'./defaults'
], function (
	APR,
	access,
	eachProperty,
	loadElement,
	check,
	createPrivateKey,
	findElements,
	stringToJSON,
	defaults
) {

	'use strict';

	var STATE_NON_CALLED = 0,
		STATE_CALLING = 1,
		STATE_CALLED = 2;

	var definedModules = {};

	var privateStore = createPrivateKey();

	function setModule (id, theModule) {
		return definedModules[id] = theModule;
	}

	function getModule (id) {
		return definedModules[id];
	}

	function hasModule (id) {
		return id in definedModules;
	}

	function callModule (someModule) {

		var dependencies;
		
		if (someModule.state === STATE_CALLED) {
			return true;
		}

		someModule.state = STATE_CALLING;

		if (!someModule.dependencies) {

			dependencies = someModule.dependencyIDs.map(function (dependencyID) {
				return getModule(dependencyID);
			});
			
			if (dependencies.some(function (dependency) {
				return !dependency || dependency.state === STATE_NON_CALLED;
			})) {
				return false;
			}

			someModule.dependencies = dependencies;

		}

		if (someModule.handler) {
			someModule.returnedValue = someModule.handler.apply(null,
				someModule.dependencies.map(function (dependency) {
					return dependency.returnedValue;
				})
			);
		}

		someModule.state = STATE_CALLED;

		return true;

	}

	var timeout;

	function updateModules () {
		
		clearTimeout(timeout);

		timeout = setTimeout(function () {

			var nonReadyModules = [];
			var somethingNewWasCalled = false;

			eachProperty(definedModules, function (someModule, id) {

				if (!someModule || someModule.state === STATE_CALLED) {
					return;
				}

				if (callModule(someModule)) {
					somethingNewWasCalled = true;
				}
				else {
					nonReadyModules.push(someModule);
				}

			});

			if (somethingNewWasCalled) {
				return updateModules();
			}

			if (nonReadyModules.length) {
				return false;
			}

			return true;

		}, 0);

	}

	function loadModuleByID (moduleID, listener) {

		var context = APR.Define;
		var url = context.files[moduleID];
		var eventListener = defaults(listener, APR.Define.DEFAULT_LOAD_LISTENER);

		if (!(moduleID in context.files)) {
			throw new TypeError(moduleID + ' must be added to "files".');
		}

		loadElement('script', url, function (event) {

			var error = (event.type === 'error'
				? new Error('Error loading the following url: ' + this.src)
				: null
			);
			var globals = context.globals;

			if (moduleID in globals && !getModule(moduleID)) {

				new APR.Define(moduleID, defaults(globals[moduleID], function () {
					return access(window, globals[moduleID].split('.'), null, {
						'mutate': true
					});
				}));
			}

			eventListener.call(this, error, {
				'event': event,
				'id': moduleID,
				'url': url
			});

		});

	}

	function normalizeIDs (ids) {

		if (check(ids, null, void 0)) {
			ids = [];
		}

		return defaults(ids, [ids]).map(function (value) {
			
			var id = check.throwable(value, 'string');

			if (!hasModule(id)) {
				loadModuleByID(id);
			}

			return id;

		});

	}

	APR.setModule('Define', /** @lends APR.Define */
	function APRDefine (id, dependencyIDs, value) {

		var handler;

		if (!(this instanceof APRDefine)) {
			return new APRDefine(id, dependencyIDs, value);
		}

		if (typeof id !== 'string') {
			throw new TypeError('The id must be a string');
		}

		if ((typeof value === 'undefined' && !check(dependencyIDs, []))
			|| typeof dependencyIDs === 'function') {
			value = arguments[1];
			dependencyIDs = [];
		}

		if (typeof value === 'function') {
			handler = value;
		}

		Object.defineProperties(privateStore(this), {

			'state': {
				'value': STATE_NON_CALLED,
				'writable': true
			},
			'id': {
				'value': id
			},
			'dependencyIDs': {
				'value': normalizeIDs(dependencyIDs)
			},
			'handler': {
				'value': handler
			},
			'returnedValue': {
				'value': handler ? void 0 : value,
				'writable': true
			}

		});

		setModule(id, privateStore(this));
		
		updateModules();

	}, /** @lends APR.Define */{
		'DEFAULT_LOAD_LISTENER': {
			'value': function (error, data) {
				
				var id = data.id;
				var givenUrl = data.url;
				var theModule = getModule(id);
				var loadedUrl = this.src;

				if (!getModule(loadedUrl) && id !== loadedUrl && id !== givenUrl) {
					new APR.Define(loadedUrl, [id], function (theModule) {
						return theModule;
					});
				}

			}
		},
		'files': {
			'value': {},
			'writable': true
		},
		'globals': {
			'value': {},
			'writable': true
		},
		'addGlobals': {
			'value': function (value) {
				var context = APR.Define;
				Object.assign(context.globals, value);
				return context;
			}
		},
		'addFiles': {
			'value': function (value) {
				var context = APR.Define;
				Object.assign(context.files, value);
				return context;
			}
		},
		'load': {
			'value': function (value) {
				
				if (check(value, {})) {
					eachProperty(check.throwable(value, {}), function (listener, id) {
						loadModuleByID(id, check.throwable(listener, Function, null, void 0));
					});
				}
				else if (check(value, [], 'string')) {
					[].forEach.call(arguments, function (id) {
						loadModuleByID(id);
					});
				}
				else {
					check.throwable(value, {}, [], 'string');
				}

				return APR.Define;

			}
		},
		'isDefined': {
			'value': hasModule
		},
		'clean': {
			'value': function () {
				definedModules = {};
				return APR.Define;
			}
		},
		/**
		 * Defines modules within attributes in the current document with {@link APR~Define}.
		 * 
		 * Those elements must have an attribute with a JSON as a value in which the "key" is the 
		 * module name and the "value" is the URL (or the value of an attribute [containing the URL]
		 * if the attribute name is enclosed within brackets).
		 *
		 * @example <caption>Adding the attribute to a link Element.</caption>
		 *
		 * <link rel='preload' href='/js/index.js' id='index' data-APR-Define='{"[id]Module" : "[href]"}' />
		 * // Preloads "/js/index.js" and defines the module "indexModule" with "/js/index.js" as the URL.
		 *
		 * @example <caption>Adding multiple links to the script tag which loads "js".</caption>
		 *
		 * <script src='js' data-APR-Define='{"index" : "/js/index.js", "module" : "/js/module.js"}'></script>
		 *
		 */
		'findInDocument': {
			'value': function (attributeName, container) {
				
				var files = {};

				findElements('*[' + attributeName + ']', container).forEach(function (element) {

					var files = stringToJSON((element.getAttribute(attributeName) + '')
						.replace(/\[([^\]]+)\]/ig, function (_, key) {
						return element.getAttribute(key);
					}));

					Object.assign(this, files);

				}, files);

				return files;

			}
		}

	});

	return (function (APRDefine) {

		var files = APRDefine.findInDocument('data-APR-Define');

		APR.Define.addFiles(files);

		if ('main' in files) {
			APR.Define.load('main');
		}

		return APRDefine;

	})(APR.Define);

});
