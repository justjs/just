APR.Define('APR/Element').using({
	'0:APR/Event' : APR.self.setFileUrl('APREvent', 'js'),
	'1:APR/State' : APR.self.setFileUrl('APRState', 'js')
}, function (APREvent, APRState) {

	'use strict';

	var ArrayProto = Array.prototype;
	var _ = Object.assign(APR.createPrivateKey(), {
		
		'createElement' : function (tagName, namespace) {

			var namespaceURI = APR.ELEMENT_NAMESPACES[namespace] || APR.ELEMENT_NAMESPACES[tagName = tagName.toLowerCase().trim()] || namespace;
			
			return (namespaceURI
				? document.createElementNS(namespaceURI, tagName)
				: document.createElement(tagName)
			);

		},
		'createBounds' : function (position, size) {

			var x = position.x << 0 || position.left << 0;
			var y = position.y << 0 || position.top << 0;
			var width = size.width << 0;
			var height = size.height << 0;

			return {
				'x' : x,
				'y' : y,
				'left' : x,
				'top' : y,
				'width' : width,
				'height' : height,
				'bottom' : y + height,
				'right' : x + width
			};

		},
		'getWindowBounds' : function () {
			
			var html = APR.html;
			var position = {
				'x' : window.scrollX || window.pageXOffset || html.scrollLeft,
				'y' : window.scrollY || window.pageYOffset || html.scrollTop
			};
			var size = {
				'width' : window.innerWidth || html.clientWidth,
				'height' : window.innerHeight || html.clientHeight
			};

			return _.createBounds(position, size);

		},
		'getDocumentBounds' : function () {

			var html = APR.html;
			var body = APR.body;
			var position = {
				'x' : 0,
				'y' : 0
			};
			var size = {
				'width' : Math.max(
					body.scrollWidth,
					body.offsetWidth,
					html.clientWidth,
					html.scrollWidth,
					html.offsetWidth
				),
				'height' : Math.max(
					body.scrollHeight,
					body.offsetHeight,
					html.clientHeight,
					html.scrollHeight,
					html.offsetHeight
				)
			};

			return _.createBounds(position, size);

		}
	});

	function APRElement (elements) {

		if (!(this instanceof APRElement)) {
			return new APRElement(elements);
		}

		if (elements instanceof APRElement) {
			return elements;
		}

		if (typeof elements === 'undefined') {
			elements = [];
		}
		else if (typeof elements === 'string') {
			elements = APRElement.findAll(elements);
		}
		else if (!Array.isArray(elements)) {
			throw new TypeError(elements + ' should be either an string or an array.');
		}

		if (this.constructor === APRElement) {
			this.length = ArrayProto.push.apply(this, elements);
		}

		APRState.call(this);
	
	}

	Object.assign(APRElement, {
		'createElement' : function (elementAsString) {

			var tagName = (elementAsString.match(/(^|\t+)[a-z0-9\s]+/i) || [''])[0].trim();
			var stringParts = elementAsString.split('>');
			var namespace, attributes = stringParts[0].replace(/\:(\.*)\;/, function (_, ns) {
				namespace = ns;
				return '';
			});
			var text = stringParts[1] || '';
			var element;

			if (!tagName) {
				return document.createTextNode(text);
			}

			element = new APRElement(_.createElement(tagName, namespace));

			// FIX: Backreference didn't work on quotes. 
			attributes = attributes.replace(/\[\s*([\w\-\:]+)(\s*\=\s*(\"([^\"]*)\"|\'([^\"]*)\')\s*)?\]/g, function replaceAttribute (regexp, name, quoted, attributeValue, valueDoubleQuotes, valueSingleQuotes) {
				element.setAttributes(APR.setDynamicKeys({}, [
					name, attributeValue ? (valueDoubleQuotes || valueSingleQuotes) : true
				]), namespace);
				return '';
			}).trim();

			attributes = attributes.replace(/\[\s*([\w\-]+)\s*\=\s*(\"(\{.+\})\"|\'(\{.+\})\')\s*\]/, function replaceJSONAttribute (_, name, value, json) {
				element.setAttributes(APR.setDynamicKeys({}, [
					name, json
				]), namespace);
				return '';
			});

			attributes = attributes.replace(/\.([\w\-]+)/g, function replaceClass (_, name) {
				element.chain('classList.add')(name);
				return '';
			}).trim();

			attributes = attributes.replace(/\#([\w\-]+)/g, function replaceID (_, id) {
				element.chain('setAttribute')('id', id);
				return '';
			}).trim();

			element.setText(text);

			return element.get();

		},
		'findAllByState' : function () {
			return APRState.findElementsByState.apply(null, arguments);
		},
		'findAll' : function (selector, parent) {
			return APR.getElements(selector, parent);
		},
		'find' : function (selector, parent) {
			return APR.getElements(selector, parent)[0];
		},
		'autoresizeTextarea' : function (textarea) {

			if (!/^textarea$/i.test(textarea.tagName)) {
				throw new TypeError('The given element is not a textarea.');
			}

			textarea.style.height = 'auto';
			textarea.style.height = textarea.scrollHeight + 'px';

			return textarea;

		}
	});

	APRElement.prototype = Object.assign(Object.create(APRState.prototype), APRElement.prototype, {

		'get' : function (handler) {

			var results = APR.eachElement(this, function (element, i) {
				return typeof handler === 'function' ? handler.call(element, new APRElement(element), i) : element;
			});

			return APR.getFirstOrMultiple(results);

		},
		'each' : function (fn) {

			if (typeof fn === 'function') {
				throw new TypeError(fn + ' must be a function.');
			}

			ArrayProto.forEach.call(this, function (element, i) {
				fn.call(element, new APRElement(element), i, this);
			}, this);

			return this;

		},
		/**
		 * @example <caption></caption>
		 * APRElement('body, html')
		 *     .chain('style', {top: '10px', left: '10px'})
		 *     .chain('setAttribute')('a', 1)
		 *     .chain('onload', function newFunction (log) { log(this.onload); })(console.log)
		 *     .chain('property', {pushed: ['a']})
		 *     .chain('property.pushed', ['b', 'c'])
		 *     .chain('property.pushed', [])
		 *     .chain(function (log, property) { log(this.property[property]); })(console.log, 'pushed')
		 *     .results;
		 * 
		 * @example <caption>If you want the returned values, you can access to the `results` property:</caption>
		 * APRElement('body, html').chain('classList.contains')('someClass').results;
		 * // returns [APR.body.classList.contains('someClass'), APR.html.classList.contains('someClass')]
		 * 
		 */
		'chain' : function (property, value, isValueUndefined) {

			var propertyPath, fn;

			if (typeof property === 'function') {
				fn = property;
			}
			else {
				propertyPath = APR.defaults(property, String(property).split('.'));
			}

			if (typeof value !== 'undefined' || isValueUndefined && propertyPath) {
				
				this.each(function () {
					
					APR.access(this, propertyPath, function (element, property) {

						var elementProperty = element[property];

						if (value && elementProperty && typeof value === 'object' && typeof elementProperty === 'object' && !APR.isEmptyObject(value)) {
							Object.assign(elementProperty, value);
						}
						else {
							elementProperty = value;
						}

					}, true);

				});

				if (typeof value !== 'function') {
					return this;
				}
				
				fn = value;

			}
			
			return function (arg) {

				var args = arguments;
				var results = APR.eachElement(this, function (element) {
					return (fn || APR.access(element, propertyPath)).apply(this, args);
				});

				this.results = APR.getFirstOrMultiple(results);

				return this;

			}.bind(this);

		},
		'setText' : function (text) {

			text = APR.defaults(text, '');
			
			ArrayProto.forEach.call(this, function (element) {
			
				if ('textContent' in element) {
					element.textContent = text;
				}
				else if ('innerText' in element) {
					element.innerText = text;
				}

			});

			return this;

		},
		'getText' : function () {

			var results = APR.eachElement(this, function (element) {

				return (
					'textContent' in element ? element.textContent :
					'innerText' in element ? element.innerText :
					''
				);

			});

			return APR.getFirstOrMultiple(results);

		},
		/**
		 *  
		 *	@returns {Object} top, left, right, bottom,
		 *		width, height, x and y
		 *
		 */
		'getBounds' : function () {

			var results = APR.eachElement(this, function (element) {

				var bounds;
				var elementBounds;

				if (APR.isWindow(element)) {
					return _.getWindowBounds();
				}
				else if (/^html$/i.test(element.tagName)) {
					return _.getDocumentBounds();
				}

				try {
					bounds = element.getBoundingClientRect();
				}
				catch (exception) {/* unspecified error IE11 (?) */}

				return _.createBounds(bounds, {
					'width' : bounds.width || (bounds.right - bounds.left),
					'height' : bounds.height || (bounds.bottom - bounds.top)
				});

			});

			return APR.getFirstOrMultiple(results);

		},
		'isInsideBounds' : function (bounds) {

			var results = APR.eachElement(this, function (element) {

				var elementBounds = new APRElement(element).getBounds();

				return (
					elementBounds.bottom > 0 &&
					elementBounds.right > 0 &&
					elementBounds.left < bounds.width &&
					elementBounds.top < bounds.height
				);

			});

			return APR.getFirstOrMultiple(results);

		},
		'fitInBounds' : function (bounds) {

			ArrayProto.forEach.call(this, function (element) {

				var ratio = Math.min(bounds.width / element.width, bounds.height / element.height);

				element.width *= ratio;
				element.height *= ratio;

			});

			return this;

		},
		'isVisible' : function () {
			
			var results = APR.eachElement(this, function (element) {

				var bounds = element.getBounds();

				return !APRElement(element).isHidden() && !!(bounds.width || bounds.height);

			});
			
			return APR.getFirstOrMultiple(results);

		},
		'isOnScreen' : function () {

			var results = APR.eachElement(this, function (element) {
				var AprElement = new APRElement(element);
				return AprElement.isVisible() && AprElement.isInsideBounds(_.getWindowBounds());
			});

			return APR.getFirstOrMultiple(results);

		},
		'getAttributes' : function () {
			
			var results = APR.eachElement(this, function (element) {

				var attributes = {};

				APR.eachProperty(element.attributes, function (attribute) {
					elements[attribute.name || attribute.nodeName] = attribute.value || attribute.nodeValue;
				});

				return attributes;
			
			});

			return APR.getFirstOrMultiple(results);

		},
		'setAttributes' : function (attributes) {

			if (!APR.isKeyValueObject(attributes)) {
				throw new TypeError(attributes + ' must be a key-value object.');
			}

			ArrayProto.forEach.call(this, function (element) {

				APR.eachProperty(attributes, function (value, name) {
					
					var namespace = name.split(':')[0];
					var namespaceURI = APR.ELEMENT_NAMESPACES[namespace];

					if (namespaceURI) {
						this.setAttributeNS(namespaceURI, name.split(':')[1], value);
					}
					else {
						this.setAttribute(name, value);
					}

				}, element);

			});

			return this;

		},
		'replaceAttributes' : function (attributes, allowEmptyValues) {

			ArrayProto.forEach.call(this, function (element) {

				APR.eachProperty(attributes, function (newName, name) {
					
					var value = this.getAttribute(name) || '';
					
					if (!value && !allowEmptyValues) {
						return;
					}

					this.removeAttribute(name);
					this.setAttribute(newName, value);

				}, element);

			});

			return this;

		},
		'removeAttributes' : function (attribute) {
		
			var attributes = arguments;

			ArrayProto.forEach.call(this, function (element) {

				APR.eachElement(attributes, function (name) {
					this.removeAttribute(name);
				}, element);

			});

			return this;

		},
		'cloneAttributes' : function (target) {
			return this.setAttributes(new APRElement(target).getAttributes());
		},
		'find' : function (selector) {

			var results = APR.eachElement(this, function (parent) {
				return new APRElement(APRElement.find(selector, parent));
			});

			return APR.getFirstOrMultiple(results);

		},
		'findAll' : function (selector) {
			
			var results = APR.eachElement(this, function (parent) {
				return new APRElement(APRElement.findAll(selector, parent));
			});

			return APR.getFirstOrMultiple(results);

		},
		'findAllByState' : function (state) {

			var results = APR.eachElement(this, function (parent) {
				return new APRElement(APRElement.findAllByState(state, parent));
			});

			return APR.getFirstOrMultiple(results);

		},
		'clone' : function (options) {

			var deep = APR.defaults((options = APR.defaults(options, {})).deep, true);
			var results = APR.eachElement(this, function (target) {
				
				return new APRElement(target.cloneNode(deep)).copy({
					'doNotCloneAttributes' : true
				});

			});

			return APR.getFirstOrMultiple(results);

		},
		'remove' : function () {
			
			APR.eachElement(this, function (element) {
				element.parentNode.removeChild(element);
			});

			return this;

		},
		'removeChildren' : function () {

			APR.eachElement(this, function (element) {

				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}

			});

			return this;

		},
		'isHidden' : function () {
			
			var results = APR.eachElement(this, function (element) {
				return element.parentNode === null || element.getAttribute('hidden') !== null;
			});
			
			return APR.getFirstOrMultiple(results);

		},
		'replaceWith' : function (newElement) {

			var results = APR.eachElement(this, function (target) {
				return new APRElement(target.parentNode.replaceChild(newElement, target));
			});

			return APR.getFirstOrMultiple(results);

		},
		'copy' : function (options) {

			options = APR.defaults(options, {});

			ArrayProto.forEach.call(this, function (element) {

				if (!options.doNotCloneAttributes) {
					element.cloneAttributes(target);
				}

				if (!options.doNotCloneEvents) {
					element.cloneEvents(target);
				}

				if (!options.doNotCloneProperties) {
					element.cloneProperties(target);
				}

				if (!options.doNotCloneStates) {
					element.cloneStates(target);
				}

			});

			return this;

		},
		'replaceTag' : function (tagName) {
			
			var newElement = new APRElement(APRElement.createElement(tagName)).copy();
				
			this.replaceWith(newElement);

			return newElement;

		},
		'getRemoteParent' : function (fn) {
			
			var results = APR.eachElement(this, function (element) {
				return APR.getRemoteParent(element, fn);
			});

			return APR.getFirstOrMultiple(results);
		
		}
	}, (function () {

		var properties = APR.createPrivateKey();

		return {
			'accessToProperty' : function (path, fn) {
				
				ArrayProto.forEach.call(this, function (element) {
					APR.access(properties(element), path, fn);
				});

				return this;

			},
			'setProperty' : function (path, value) {

				this.accessToProperty(path, function (v, k) {
					v[k] = value;
				});

				return this;

			},
			'getProperty' : function (path) {
				return this.accessToProperty(arguments, function (v, k, exists) {
					return exists ? v[k] : void 0;
				});
			},
			'hasProperty' : function (path) {
				return this.accessToProperty(arguments, function (v, k, exists) {
					return exists;
				});
			},
			'removeProperty' : function (path) {
				
				this.accessToProperty(arguments, function (v, k) {
					delete v[k];
				});

				return this;

			},
			'getAllProperties' : function () {

				var results = APR.eachElement(this, function (element) {
					return Object.assign({}, properties(element));
				});

				return APR.getFirstOrMultiple(results);

			},
			'cloneProperties' : function (target) {

				var targetProperties = Object.assign({}, properties(target));

				ArrayProto.forEach.call(this, function (element) {
					Object.assign(properties(element), targetProperties);
				});

				return this;
			}
		};

	})(), {'constructor' : APRElement});
		
	if (!APR.Element) {
		APR.Element = APRElement;
	}

});