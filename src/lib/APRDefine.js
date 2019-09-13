define([
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

	var root = window;

	var STATE_NON_CALLED = 0,
		STATE_CALLING = 1,
		STATE_CALLED = 2;

	var definedModules = {};

	var privateStore = createPrivateKey();

	/**
	 * A module loader: it loads {@link APR.Define~file|files} in order (when needed) and
	 * execute them when all his dependencies became available.
	 *
	 * <br/>
	 * <aside class='note'>
	 *     <h3>A few things to consider: </h3>
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
	 * </aside>
	 *
	 * @class
	 * @memberof APR
	 * @param {!string} id - The module id.
	 * @param {string[]|string} dependencyIDs - Required module ids.
	 * @param {*} value - The module value.
	 *
	 * @example
	 * var files = APR.Define.findInDocument('data-files');
	 * var fileIDs = Object.keys(files);
	 *
	 * APR.Define.load(files);
	 * APR.Define('some id', fileIDs, function (file1, file2, ...) {
	 *     // Loads after all ids have been defined.
	 * });
	 */
	var Define = function APRDefine (id, dependencyIDs, value) {

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

	};

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
		/* istanbul ignore else */
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

		var urlParts = (Define.files[moduleID] || '').split(' ');
		var eventListener = defaults(listener, Define.DEFAULT_LOAD_LISTENER);
		var url = urlParts[1];
		var tagName = urlParts[0];

		if (!url) {
			url = urlParts[0];
			tagName = 'script';
		}

		loadElement(tagName, url, function (event) {

			var error = (event.type === 'error'
				? new Error('Error loading the following url: ' + this.src)
				: null
			);
			var globals = Define.globals;

			if (moduleID in globals && !getModule(moduleID)) {

				new Define(moduleID, defaults(globals[moduleID], function () {
					return access(root, globals[moduleID].split('.'), null, {
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

	Object.defineProperties(Define, /** @lends APR.Define */{
		/**
		 * A function to be called when the {@link APR.Define~file|file} load.
		 * 
		 * @typedef {function} APR.Define~load_listener
		 * @param {!Error} error - An error if the url is not being loaded.
		 * @param {!object} data - Some metadata.
		 * @param {!Event} data.event - The triggered event: "load" or "error".
		 * @param {!APR.Define~id} data.moduleID - The id passed to {@link APR.Define}.
		 * @param {!url} data.url - The loaded url.
		 */

		/**
		 * Default {@link APR.Define~load_listener|listener} for the load event.
		 * @type {APR.Define~load_listener}
		 * @readonly
		 */
		'DEFAULT_LOAD_LISTENER': {
			'value': function (error, data) {
				
				var id = data.id;
				var givenUrl = data.url;
				var theModule = getModule(id);
				var loadedUrl = this.src;

				/* istanbul ignore else */
				if (!getModule(loadedUrl) && id !== loadedUrl && id !== givenUrl) {
					new Define(loadedUrl, [id], function (theModule) {
						return theModule;
					});
				}

			}
		},
		/**
		 * Finds {@link APR.Define.files|files} within the document, adds them, and
		 * if some is called "main", it loads it.
		 * <br/>
		 * <aside class='note'>
		 *     <h3>Note</h3>
		 *     <p>This function is called when the file is loaded.</p>
		 * </aside>
		 *
		 * @function
		 * @chainable
		 */
		'init': {
			'value': function () {
				var files = Define.findInDocument('data-APR-Define');

				Define.addFiles(files);

				/* istanbul ignore else */
				if ('main' in files) {
					Define.load('main');
				}

				return Define;
			}
		},
		/**
		 * A function to load {@link APR.Define~file|files} by ids.
		 *
		 * @function
		 * @param {APR.Define~file_id|APR.Define~file_id[]|Object.<
		 *     APR.Define~file_id,
		 *     APR.Define~load_listener
		 * >} value - {@link APR.Define~file_id|File ids}.
		 * @chainable
		 */
		'load': {
			'value': function (value) {
				var throwOnBadID = function (id) {
					if (!(id in Define.files)) {
						throw new TypeError(id + ' must be added to "files".');
					}
				};

				if (check(value, {})) {
					eachProperty(check.throwable(value, {}), function (listener, id) {
						throwOnBadID(id);
						loadModuleByID(id, check.throwable(listener, Function, null, void 0));
					});
				}
				else if (check(value, [], 'string')) {
					defaults(value, [value]).forEach(function (id) {
						throwOnBadID(id);
						loadModuleByID(id);
					});
				}
				else {
					check.throwable(value, {}, [], 'string');
				}

				return Define;

			}
		},
		/**
		 * An alias for a url.
		 *
		 * @typedef {string} APR.Define~file_id
		 */

		/**
		 * Any element that references an external source, like an
		 * &lt;script&gt; or a &lt;link&gt;.
		 * 
		 * @typedef {string} APR.Define~file
		 */

		/**
		 * A url, or a tag name with a url splitted by an space.
		 * 
		 * By default, "http://..." is the same as "script http://..."
		 *
		 * @typedef {string} APR.Define~files_expression
		 *
		 * @example <caption>A url</caption>
		 * "http://..."
		 *
		 * @example <caption>A tag name with a url.</caption>
		 * "link /index.css"; // Note the space in between.
		 */

		/**
		 * Aliases for urls.
		 * 
		 * @type {Object.<
		 *     APR.Define~file_id,
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
		 * Assigns values to {@link APR.Define.globals|the globals property}.
		 * 
		 * @function
		 * @chainable
		 * @param {APR.Define.globals} value - {@link APR.Define.globals|Globals}.
		 */
		'addGlobals': {
			'value': function (value) {
				Object.assign(Define.globals, value);
				return Define;
			}
		},
		/**
		 * Assigns values to {@link APR.Define.files|the files property}.
		 *
		 * @function
		 * @chainable
		 * @param {APR.Define.files} value - {@link APR.Define.files|Files}.
		 */
		'addFiles': {
			'value': function (value) {
				Object.assign(Define.files, value);
				return Define;
			}
		},
		/**
		 * Checks if module has been defined.
		 *
		 * @function
		 * @param {APR.Define~id} id - The id passed to {@link APR.Define}.
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
				return Define;
			}
		},
		/**
		 * Finds {@link APR.Define.files|files} within the document
		 * by selecting all the elements that contain an specific
		 * attribute and parsing that attribute as a JSON.
		 * <br/>
		 * <aside class='note'>
		 *     <h3>Note</h3>
		 * 	   <p>Values within brackets will be replaced with
		 *     actual attributes for that element.</p>
		 *     <p>I.e.: &lt;span a='123' data-files='{"[a]456": "[a]456"}'&gt;&lt;/span&gt;
		 *     will become: {123456: '123456'}</p>
		 * </aside>
		 *
		 * @function
		 * @param {string} attributeName - The attribute which defines the
		 *     {@link APR.Define.files|files} to be loaded.
		 * @param {Element} [container=document]
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
		 * @return {!APR.Define.files}
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

	return APR.setModule('Define', Define.init());

});
