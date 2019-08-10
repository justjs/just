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

	function updateModules () {
		
		clearTimeout(updateModules.timeout);

		updateModules.timeout = setTimeout(function () {

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
		var urlParts = (context.files[moduleID] || '').split(' ');
		var eventListener = defaults(listener, APR.Define.DEFAULT_LOAD_LISTENER);
		var url = urlParts[1];
		var tagName = urlParts[0];

		if (!(moduleID in context.files)) {
			throw new TypeError(moduleID + ' must be added to "files".');
		}

		if (!url) {
			url = urlParts[0];
			tagName = 'script';
		}

		loadElement(tagName, url, function (event) {

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

	APR.setModule('Define',
	/**
	 * A module loader: it loads files in order (when needed) and
	 * execute them when all his dependencies became available.
	 *
	 * <footer>
	 *     <p>A few things to consider: </p>
	 *     <ul>
	 *         <li>This is not intended to be AMD compliant.</li>
	 *    
	 *         <li>This does not check file contents, so it won't check if the
	 *             file defines an specific id.</li>
	 *    
	 *         <li>Urls passed as dependencies are considered ids, so they must
	 *             be aliased first in order to be loaded.</li>
	 *     
	 *         <li>`require`, `module` and `exports` are not present in this
	 *             loader.</li>
	 *     
	 *         <li>Anonymous modules are not allowed.</li>
	 *     </ul>
	 * </footer>
	 *
	 * @class APR.Define
	 *
	 * @param {string} id The module id.
	 * @param {!string[]|string} dependencyIDs Required module ids.
	 * @param {*} value The module value.
	 *
	 */
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
		/**
		 * @typedef {Object.<key, value>} APR.Define~load_data
		 *
		 * @property {Event} event The triggered event: load or error.
		 * @property {APR.Define~id} moduleID The module id.
		 * @property {string} url The loaded url. 
		 */
		/**
		 * A function to be called when the element loads.
		 * 
		 * @typedef {function} APR.Define~load_listener
		 * @param {?Error} error An error if the url is not being loaded.
		 * @param {APR.Define~load_data} data Some metadata.
		 */
		/**
		 * Same as {@link APR.Define~load_listener}.
		 * 
		 * @function
		 * @readOnly
		 */
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
		/**
		 * A function to load files by ids.
		 *
		 * @function
		 * @param {APR.Define~files_fileID|APR.Define~files_fileID[]|Object.<
		 *     APR.Define~files_fileID,
		 *     ?APR.Define~load_listener
		 * >} value File ids.
		 * @chainable
		 */
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
		/**
		 * An alias for a url.
		 *
		 * @typedef {string} APR.Define~files_fileID
		 */

		/**
		 * An url, or a tag name with an url splitted by an space.
		 * 
		 * By default, "http://..." is the same as "script http://..."
		 *
		 * @typedef {string} APR.Define~files_expression
		 *
		 * @example <caption>An url</caption>
		 * "http://..."
		 *
		 * @example <caption>A tag name with an url.</caption>
		 * "link /index.css"; // Note the space in between.
		 */

		/**
		 * Aliases for urls.
		 * 
		 * @type {Object.<
		 *     APR.Define~files_fileID,
		 *     APR.Define~files_expression
		 * >}
		 */
		'files': {
			'value': {},
			'writable': true
		},
		/**
		 * A function that returns the module value or a string
		 * splitted by '.' that will be {@link APR~access|accessed}
		 * from `window`.
		 * 
		 * @typedef {string|function} APR.Define~globals_expression
		 *
		 * @example <caption>A function.</caption>
		 * function () { return 1; } // The module value is 1.
		 *
		 * @example <caption>A string.</caption>
		 * "a.b"; // accesses to window, then window.a,
		 *        // and then returns window.a.b
		 */
		/**
		 * Aliases for ids.
		 *
		 * @type {Object.<
		 *     APR.Define~id,
		 *     APR.Define~globals_expression
		 * >}
		 */
		'globals': {
			'value': {},
			'writable': true
		},
		/**
		 * Assigns values to {@link APR.globals}.
		 * 
		 * @function
		 *
		 * @param {APR.Define~globals} value Globals.
		 *
		 * @chainable
		 */
		'addGlobals': {
			'value': function (value) {
				var context = APR.Define;
				Object.assign(context.globals, value);
				return context;
			}
		},
		/**
		 * Assigns values to {@link APR.files}.
		 *
		 * @function
		 * @param {Object.<key, value>} value Files.
		 *
		 * @chainable
		 */
		'addFiles': {
			'value': function (value) {
				var context = APR.Define;
				Object.assign(context.files, value);
				return context;
			}
		},
		/**
		 * Checks if module has been defined.
		 *
		 * @function
		 * @param {APR.Define~id} id
		 * @return {boolean} `true` if defined, `false` otherwise.
		 */
		'isDefined': {
			'value': hasModule
		},
		/**
		 * Removes all defined modules.
		 *
		 * @function
		 * @chainable
		 */
		'clean': {
			'value': function () {
				definedModules = {};
				return APR.Define;
			}
		},
		/**
		 * Finds {@link APR.Define~files|files} within the document
		 * by selecting all the elements that contain an specific
		 * attribute and parsing that attribute as a JSON.
		 *
		 * Note that values within brackets will be replaced with
		 * actual attributes for that element.
		 * I.e.: <span a='123' data-files='{"[a]456": "[a]456"}'></span>
		 * will become: {123456: '123456'}
		 *
		 * @function
		 * @param {string} attributeName Some attribute.
		 * @param {Element} container Some container.
		 *
		 * @example
		 * // Considering the following document:
		 * < body>
		 *     < div id='a' data-files='{"[id]": "link a.css"}'>< /div>
		 *     < script src='b.js' data-files='{"b": "script [src]"}'>< /script>
		 * < /body>
		 *
		 * // then, in js:
		 * findInDocument('data-files');
		 * // Should return {a: 'link a.css', b: 'script b.js'}.
		 * 
		 * @return {!APR.Define~files}
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
	
	/**
	 * Finds files within the document, adds them, and
	 * if some of it is called "main", it loads it.
	 *
	 * @function APR.Define.init
	 * @package
	 */
	return (function init (APRDefine) {

		var files = APRDefine.findInDocument('data-APR-Define');

		APR.Define.addFiles(files);

		if ('main' in files) {
			APR.Define.load('main');
		}

		return APRDefine;

	})(APR.Define);

});
