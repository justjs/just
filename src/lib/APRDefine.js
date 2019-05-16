define('APRDefine', [
	'./var/head',
	'./access',
	'./eachProperty',
	'./loadElement',
	'./createPrivateKey',
	'./getElements'
], function (head, access, eachProperty, loadElement, createPrivateKey, getElements) {

	'use strict';

	var _ = (function () {

		var STATE_DEFINED = 'defined',
			STATE_CALLED = 'called';

		var modules = {
			'defined': {},
			'currentlyLoadingIDs': []
		};
		
		function addLoadingModule (id) {

			var moduleLoadingIDs = modules.currentlyLoadingIDs;

			if (moduleLoadingIDs.indexOf(id) >= 0) {
				return -1;
			}

			return modules.currentlyLoadingIDs.push(id);

		}

		function removeLoadingModule (id) {
			
			var moduleLoadingIDs = modules.currentlyLoadingIDs;
			
			return moduleLoadingIDs.splice(moduleLoadingIDs.indexOf(id), 1);

		}

		function getModule (id) {
			return modules.defined[id] || access(window, id.split(APRDefine.ID_SEPARATOR));
		}

		function callModule (someModule) {

			var id = someModule.id;
			var dependencyIDs = someModule.dependencyIDs;
			var dependencies;

			if (someModule.state === STATE_CALLED) {
				return true;
			}

			dependencies = dependencyIDs.map(function (dependencyID) {
				return getModule(dependencyID);
			});
			
			if (dependencies.some(function (isDefined) { return !isDefined; })) {
				return false;
			}

			defineModule.handler.apply(null, dependencies);
			someModule.state = STATE_CALLED;

			return true;

		}

		function callModules (modules, state) {

			var results = {};

			eachProperty(modules, function (someModule, id) {

				if (!state || someModule.state === state) {
					results[id] = callModule(someModule);
				}

			});

			return results;

		}

		function updateModules () {

			var definedModules = modules.defined;
			var moduleLoadingIDs = modules.currentlyLoadingIDs;
			var calledModuleIDs = [];
			var calledModules = {};
			var nonDefinedModules = [];

			if (moduleLoadingIDs.length) {
				return false;
			}

			calledModules = callModules(definedModules, STATE_DEFINED);

			if (Object.values(calledModules).some(function (wasCalled) { return wasCalled; })) {
				return updateModules();
			}

			calledModuleIDs = Object.keys(calledModules);
			nonDefinedModules = calledModuleIDs.filter(function (id) {
				return !getModule(id);
			});

			if (nonDefinedModules.length) {
				throw new Error('The following modules weren\'t defined: ' + nonDefinedModules);
			}
			else {
				throw new Error('Something went wrong. The following modules weren\'t loaded: ' + calledModuleIDs);
			}

			return true;

		}

		return Object.assign({

			'addLoadingModule': addLoadingModule,
			'removeLoadingModule': removeLoadingModule,
			'updateModules': updateModules

		}, createPrivateKey({

			'defineModule': function (id, dependencyIDs, handler) {
				
				if (typeof id !== 'string') {
					throw new TypeError('The id must be a string');
				}

				if (!Array.isArray(dependencies)) {
					throw new TypeError('The dependencies must be an Array');
				}

				if (typeof handler !== 'function') {
					throw new TypeError('The handler must be a function');
				}

				removeLoadingModule(id);

				Object.assign(this, {
					'state': STATE_DEFINED,
					'id': id,
					'dependencyIDs': dependencyIDs,
					'handler': handler
				});

				modules.defined[id] = this;
				
				updateModules();

				return this;

			}

		}, APRDefine));

	})();

	function APRDefine (id, dependencies, handler) {

		if (!(this instanceof APRDefine)) {
			return new APRDefine(id, dependencies, handler);
		}

		if (typeof dependencies === 'function') {
			handler = dependencies;
			dependencies = [];
		}
		else if (typeof dependencies === 'string') {
			dependencies = [dependencies];
		}

		_(this).defineModule(id, dependencies, handler);

	}

	Object.assign(APRDefine, {
		'ID_SEPARATOR': '/',
		'ATTRIBUTE_NAME': 'data-APR-define',
		'load': function (urls) {

			var loadElementHandler = function (moduleID) {

				var onLoad = function () {
					_.removeLoadingModule(moduleID);
					_.updateModules();
				};

				_.addLoadingModule(moduleID);

				return function (isLoaded) {

					if (isLoaded) {
						return onLoad(), void 0;
					}

					this.onload = function () {
						this.onload = null;
						this.onerror = null;
						onLoad();
					};

					this.onerror = function (error) {
						throw error;
					};

					head.appendChild(this);

				};

			};

			if (!isKeyValueObject(urls)) {
				throw new TypeError(urls + ' must be a key-value object.');
			}

			eachProperty(urls, function (url, moduleID) {
				loadElement('script', url, loadElementHandler(moduleID));
			});

		},
		/**
		 * Loads defined scripts within attributes in the current document with {@link Define}.
		 * 
		 * Those elements must have an attribute with a JSON as a value in which the "key" is the 
		 * module name and the "value" is the URL (or the value of an attribute [containing the URL]
		 * if the attribute name is enclosed within brackets).
		 *
		 * @example <caption>Adding the attribute to a link Element.</caption>
		 *
		 * <link rel='preload' href='/js/index.js' id='index' data-APR-define='{"[id]Module" : "[href]"}' />
		 * // Preloads "/js/index.js" and loads the module "indexModule" with "/js/index.js" as the URL.
		 *
		 * @example <caption>Adding multiple links to the script tag which loads "js".</caption>
		 *
		 * <script src='js' data-APR-define='{"index" : "/js/index.js", "module" : "/js/module.js"}'></script>
		 * @callback onDocumentReady_findScriptsToDefine
		 */
		'findScriptsToDefine': function () {
			
			getElements('*[' + APRDefine.ATTRIBUTE_NAME + ']').forEach(function (element) {

				var url = stringToJSON((element.getAttribute(APRDefine.ATTRIBUTE_NAME) || '').replace(/\[([^\]]+)\]/ig, function (_, attributeName) {
					return element.getAttribute(attributeName);
				}));

				APRDefine.load(url);

			});

		}
	});

	return APRDefine;

});