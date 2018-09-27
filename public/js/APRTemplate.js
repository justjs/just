APR.Define('APR.Template', APR).requires({
	'0.APR.Element' : APR.self.setFileUrl('APRElement', 'js')
}, function (APRElement) {

	'use strict';
	
	var _templateElements = {};

	if (!String.prototype.repeat) {
		String.prototype.repeat=function(i){var s='';while(--i>=0)s+=this;return s};
	}

	function _eachString (object, fn) {
		
		var isNotAnObject = false;

		if (typeof object !== 'object') {
			isNotAnObject = true;
			object = [object];
		}

		APR[APR.isArray(object) ? 'eachElement' : 'eachProperty'](object, function (v, k) {
			object[k] = typeof v === 'string' ? fn(v, k) : typeof v === 'object' ? _eachString(v, fn) : v;
		});
		
		return isNotAnObject ? object[0] : object;

	}

	function APRTemplate (template, data) {
		this.data = APRTemplate.escape(APR.createObject(data));
		this.separator = _getUniqueSeparator(template.toString());
		this.templateAsString = _getValidTemplateAsString(template, this.data, this.separator);
	}

	function _saveElement (element) {

		var id = _getUniqueSeparator();

		_templateElements[id] = _unescapeElement(element);

		return id;

	};

	function _getValidTemplateAsString (template, data, separator) {

		var getTemplateAsString = function getTemplateAsString (template, numTabs) {

			return APR.eachElement((APR.isArray(template) ? template : [template]), function (unknown, i) {

				var string = APR.isArray(unknown) ? convertArrayElementsToString(unknown, numTabs)
					: APR.isElement(unknown) ? _saveElement(unknown)
					: typeof unknown === 'function' ? (getTemplateAsString(unknown(data), numTabs) || '')
					: typeof unknown === 'object' ? JSON.stringify(unknown)
					: (unknown || '') + '';
				var array = APR.isArray(string) && string;

				if (array) {
					string = convertArrayElementsToString(array);
				}

				return string;

			}).join(separator);

		};
		var convertArrayElementsToString = function convertArrayElementsToString (array, extraTabs) {

			var numTabs = typeof array[0] === 'string'
				? _getNumberOfTabs(array[0])
				: APR.isArray(array[0])
				? (extraTabs || 0)
				: 0;
			var arrayOfStrings = APR.eachElement(array, function (value, i) {
				
				if (_hasOnlyTabs(value)) {
					return;
				}

				return _setTabsToEachString(numTabs, getTemplateAsString(value, numTabs).split(separator)).join(separator);
			
			}).filter(function (withValue) {
				return withValue;
			});

			return arrayOfStrings.join(separator);

		};

		return getTemplateAsString(template);
	
	}

	APRTemplate.prototype.replaceVariables = function (variableContainer) {
			
		var regexp = /\{\$([\w]+)\}/g;

		this.replacePattern(regexp, function (_, name) {
			return variableContainer[name] || _;
		});

		return this;

	};

	function _cast (value, varsData) {
		
		var isNumber = function (a) { return !isNaN(a); };
		var isArray = function (a) { return /^\[[^\]*]\]$/.test(a); };
		var isObject = function (a) {
			
			var object;

			try {
				object = JSON.parse(a);
			}
			catch (exception) {
				return false;
			}

			return typeof object === 'object';
		
		};
		var isBoolean = function (a) {
			return /true|false/i.test(a);
		};
		var isString = function (a) {
			var quotes = /(\'|\")/;
			return quotes.test(a[0]) && quotes.test(a[a.length - 1]);
		};
		var wasArray = APR.isArray(value);
		var casted = APR.eachElement((APR.isArray(value) ? value : [value]), function (unknown) {

			return isNumber(unknown) ? +unknown
				: isArray(unknown) ? Array.push.apply([], _cast(unknown.replace(/(^\[|\]$)/g, '').split(/\s*,\s*/g), varsData))
				: isObject(unknown) ? JSON.parse(unknown)
				: isBoolean(unknown) ? !!unknown
				: isString(unknown) ? APRTemplate.replaceTokens(unknown.replace(/(^(\"|\')|(\"|\')$)/g, ''), varsData, function getRegexp () {
					return this.replace(/(\{|\})/g, '');
				})
				: _getVariableValue(varsData, unknown, function (variableValue, exists) {
					return exists ? variableValue : unknown;
				});

		});


		return wasArray ? casted : casted[0];

	}
	
	APRTemplate.prototype.replaceFunctions = function (functionContainer) {

		var _this = this;
		var regexp = /(\t*)\{([\w]+)\(([^\)]*)\)\}/g;

		this.replacePattern(regexp, function (_, tabs, fnName, fnParams) {
			
			var fn = functionContainer[fnName];
			var params = [];
			var jsonParams;
			var castedParams;
			var template;

			if (typeof fn !== 'function') {
				APR.Logger.log("\"" + fnName + "\" wasn't defined inside an object of the first parameter of \"replaceFunctions\".");
				return _;	
			}

			params = fnParams.split(/(\"[^\"]*\"|\'[^\']*\'|\[.*\]|\{.+\}|[\w\.]+)(,\s*)?/g).filter(function (withValue) {
				return withValue && withValue.trim() !== ',';
			});

			castedParams = _cast(params, _this.data);

			template = fn.apply({
				'match' : _,
				'separator' : _this.separator,
				'numTabs' : _getNumberOfTabs(tabs)
			}, castedParams) || '';

			if (APR.isArray(template)) {
				return template.join(_this.separator);
			}
			else if (APR.isElement(template)) {
				return tabs + _saveElement(template);
			}

			return template + '';

		});

		return this;

	};

	APRTemplate.prototype.replaceConditionals = function () {

		var regexp = /(\t*)\{\s*if\s*(\!)?\s*([^\:]+)\:((.(?!if))+)\1endif\}/g;
		var data = this.data;

		this.replacePattern(regexp, function (conditional, tabs, operator, variable, content, _, closeTag) {

			var evalsToTrue = function (value) {
				return operator === '!' ? !value : !!value;
			};

			variable = variable.trim();

			if (!/\{|\}/.test(variable) && evalsToTrue(_cast(variable))) {
				return content;
			}

			return _getVariableValue(data, variable.replace(/\{|\}/g, ''), function (value, exists) {
				var hasValue = /*typeof value !== 'undefined' && */evalsToTrue(value);
				return hasValue ? content : '';
			});

		});

		// TEMPORAL FIX TO "if a: endif; if b: endif;" && "if a: if b: endif; endif;":
		/*if (regexp.test(this.templateAsString)) {
			this.replaceConditionals();
		}*/

		return this;

	};

	APRTemplate.prototype.replacePattern = function (pattern, fn) {
		
		this.templateAsString = this.templateAsString.replace(pattern, fn);
		
		return this;
	
	};

	APRTemplate.prototype.replaceReservedKeywords = function (replacements) {

		APR.eachProperty.call(this, replacements, function (value, key) {
			this.replacePattern(new RegExp('\{' + key + '\}', 'g'), value);
		});

		return this;

	};

	APRTemplate.prototype._replaceTokens = function () {
		return APRTemplate.replaceTokens(this.templateAsString, this.data, function getRegexp () {
			return this.replace(/(\{|\})/g, '');
		});
	};

	APRTemplate.prototype.getAsArray = function (numTabs, ignoreTokens) {

		var array = this._replaceTokens().split(this.separator);

		if (numTabs) {
			array = _setTabsToEachString(numTabs, array);
		}

		return APRTemplate.unescape(array);

	};

	function _setTabsToString (number, string) {
		return '\t'.repeat(number) + string;
	}

	function _setTabsToEachString (number, arrayOfStrings) {
		return APR.eachElement(arrayOfStrings, function (string, i) {
			return _setTabsToString(number, string)
		});
	}

	APRTemplate.prototype.getAsString = function () {
		return this._replaceTokens().replace(this.separator, '');
	};

	APRTemplate.prototype.getAsSource = function () {
		return this._replaceTokens();
	};

	APRTemplate.prototype.removeElements = function (i, num) {
		
		var templateAsArray = this.getAsArray();
		var removed = templateAsArray.splice(i, num);

		this.templateAsString = templateAsArray.join(this.separator);

		return removed;
	
	};

	APRTemplate.prototype.getAsElement = function () {
		
		var container = this.removeElements(0, 1)[0];

		return APRTemplate.parse(this.getAsArray(), {
			'container' : APRElement.createElement(container)
		});

	};

	APRTemplate.replaceTokens = function replaceTokens (string, data, getProperty) {

		APR.eachElement(_getTokens(string), function (variable) {

			_getVariableValue(data, (getProperty ? getProperty.call(variable) : variable), function (value) {

				if (typeof value !== 'undefined') {
					string = string.replace(variable, value);
				}

			});

		});

		return string;

	};

	function _hasOnlyTabs (string) {
		return !/[^\t]/.test(string);
	}

	APRTemplate.clearArray = function clearArray (array) {

		return array.filter(function (string) {
			return !_hasOnlyTabs(string);
		});

	};

	function _getNumberOfTabs (string) {
		return ((string + '').match(/\t/g) || []).length;
	}

	APRTemplate.escape = function escape (a) {
		return _eachString(a, function (string) {
			return window.escape(string);
		});
	};

	APRTemplate.unescape = function unescape (a) {
		return _eachString(a, function (string) {
			return window.unescape(string);
		});
	};

	function _unescapeElement (element) {

		APR.eachProperty(element.getAttributes(), function unescapeAttributes (value, name) {
			element.setAttribute(name, APRTemplate.unescape(value));
		});

		(function unescapeText (element) {

			if (element instanceof Text) {
				APRElement(element).setText(APRTemplate.unescape(element.getText()));
			}
			
			APR.eachElement(element.childNodes, function (child) {
				return unescapeText(child);
			});

		})(element);

		return element;
	
	}

	APRTemplate.parse = function parseTemplate (tree, options) {

		var createElementFromString = APRElement.createElement;
		var template = (options ? _unescapeElement(options.container) : void 0) || createElementFromString('div');
		var previousBranch, currentBranch;
		var usedTabs = [];

		if (!APR.isArray(tree)) {
			throw new TypeError("\"" + tree + "\" is not an array.");
		}

		APR.eachElement(APRTemplate.clearArray(tree), function (string, i) {

			var previousTabs = _getNumberOfTabs(this[i - 1]);
			var currentTabs = _getNumberOfTabs(string);

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
				previousBranch = template;
			}

			try {
				currentBranch = _templateElements[string] || createElementFromString(string);
				_unescapeElement(currentBranch).appendTo(previousBranch);
			}
			catch (exception) {
				return APR.Logger.logException(exception);
			}

		});

		_templateElements = {};

		return template;

	};

	function _getVariableValue (data, name, callback) {
		return APR.accessToADeepProperty(APR.createObject(data), name.split('.'), function (lastKey, exists) {
			return typeof callback === 'function' ? callback(this[lastKey], exists) : this[lastKey];
		});
	}

	function _getTokens (string) {
		return string.match(/\{[\w\-\.]+\}/g) || [];
	}

	function _getUniqueSeparator (string) {
		return '||' + APR.getUniqueString(string) + '||';
	}

	if (!APR.Template) {
		APR.Template = APRTemplate;
	}

});