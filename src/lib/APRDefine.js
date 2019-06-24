define('APRDefine', [
	'./core',
	'./access',
	'./eachProperty',
	'./loadElement',
	'./getElements',
	'./stringToJSON',
	'./check'
], function (
	APR,
	access,
	eachProperty,
	loadElement,
	getElements,
	stringToJSON,
	check
) {

	'use strict';

	var root = window;

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
		return modules.defined[id] || access(root, id.split(APR.Define.idSeparator));
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

		return eachProperty(modules, function (someModule, id,
			object, results) {

			if (!state || someModule.state === state) {
				results[id] = callModule(someModule);
			}

		});

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
			return APR.Define.errorHandler(
				APR.Define.ERROR_NON_DEFINED_MODULES,
				'The following modules weren\'t defined: ' + nonDefinedModules
			);
		}
		else {
			return APR.Define.errorHandler(
				APR.Define.ERROR_NON_LOADED_MODULES,
				'Something went wrong. The following modules ' +
				'weren\'t loaded: ' + calledModuleIDs
			);
		}

		return true;

	}

	return APR.setModule('Define', function APRDefine (id,
		dependencies, handler) {

		if (!(this instanceof APRDefine)) {
			return new APRDefine(id, dependencies, handler);
		}

		if (typeof id !== 'string') {
			throw new TypeError('The id must be a string');
		}
		
		if (typeof dependencies === 'function') {
			handler = dependencies;
			dependencies = [];
		}
		else if (typeof dependencies === 'string') {
			dependencies = [dependencies];
		}

		if (typeof handler !== 'function') {
			throw new TypeError('The handler must be a function');
		}

		removeLoadingModule(id);

		Object.defineProperties(this, {

			'state': {
				'value': STATE_DEFINED
			},
			'id': {
				'value': id
			},
			'dependencyIDs': {
				'value': dependencyIDs
			},
			'handler': {
				'value': handler
			}

		});

		modules.defined[id] = this;
		
		updateModules();

	}, /** @lends APR.Define */{
		'ERROR_LOADING_URL': {
			'value': 'Bad url'
		},
		'ERROR_NON_DEFINED_MODULES': {
			'value': 'Modules not found'
		},
		'ERROR_NON_LOADED_MODULES': {
			'value': 'Modules not loaded'
		},
		'idSeparator': {
			'value': '.',
			'writable': true
		},
		'attributeName': {
			'value': 'data-APR-define',
			'writable': true
		},
		'errorHandler': {
			'value': function (type, message) {
				throw new Error(type + ': ' + message);
			},
			'writable': true
		},
		'load': {
			'value': function (urls) {

				eachProperty(check.throwable(urls, {}),
					function (url, moduleID) {

					loadElement('script', url, function (e) {

						if (e.type === 'error') {
							return APR.Define.errorHandler(
								APR.Define.ERROR_LOADING_URL,
								'Error loading the following url: ' + url
							);
						}

						removeLoadingModule(moduleID);
						updateModules();

					}, function (isLoaded) {
						
						if (isLoaded) {
							return;
						}

						addLoadingModule(moduleID);
						document.head.appendChild(this);

					});
					
				});

			}
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
		'findScriptsToDefine': {
			'value': function () {
			
				getElements('*[' + APR.Define.attributeName + ']').forEach(function (element) {

					var url = stringToJSON((element.getAttribute(APR.Define.attributeName) || '').replace(/\[([^\]]+)\]/ig, function (_, attributeName) {
						return element.getAttribute(attributeName);
					}));

					APR.Define.load(url);

				});

			}
		}
	});

});