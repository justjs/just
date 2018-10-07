APR.Define('APR/Element').using({
	'0:APR/Event' : APR.self.setFileUrl('APREvent', 'js'),
	'1:APR/State' : APR.self.setFileUrl('APRState', 'js')
}, function (APREvent, APRState) {

	'use strict';

	var _ = Object.assign(APR.createPrivateKey(), {
		
		'createElement' : function (tagName, namespace) {

			var namespaces = APRElement.prototype.NAMESPACES;
			var namespaceURI = namespaces[namespace] || namespaces[tagName] || namespace;
			var element;

			tagName = tagName.toLowerCase();

			element = namespaceURI
				? document.createElementNS(namespaceURI, tagName)
				: document.createElement(tagName);

			return element;

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

		if (!APR.is(this, APRElement)) {
			return new APRElement(element);
		}

		if (APR.is(elements, APRElement)) {
			return elements;
		}

		if (APR.is(elements, 'string')) {
			elements = APRElement.findAll(elements);
		}
		else if (!APR.is(elements, [])) {
			throw new TypeError(elements + ' should be either an string or an array.');
		}

		this.length = Array.prototype.push.apply(this, elements);

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
				element.get().classList.add(name);
				return '';
			}).trim();

			attributes = attributes.replace(/\#([\w\-]+)/g, function replaceID (_, id) {
				element.get().setAttribute('id', id);
				return '';
			}).trim();

			element.setText(text);

			return element;

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
		'NAMESPACES' : {
			'html' : 'http://www.w3.org/1999/xhtml',
			'mathml' : 'http://www.w3.org/1998/Math/MathML',
			'svg' : 'http://www.w3.org/2000/svg',
			'xlink' : 'http://www.w3.org/1999/xlink',
			'xml' : 'http://www.w3.org/XML/1998/namespace',
			'xmlns' : 'http://www.w3.org/2000/xmlns/',
			'xbl' : 'http://www.mozilla.org/xbl',
			'xul' : 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'
		},
		'get' : function (handler) {

			var results = APR.eachElement(this, function (element, i) {
				return APR.is(handler, 'function') ? handler.call(element, new APRElement(element), i) : element;
			});

			return APR.getFirstOrMultiple(results);

		},
		'each' : function (fn) {

			if (APR.is(fn, 'function')) {
				throw new TypeError(fn + ' must be a function.');
			}

			APR.eachElement(this, function (element, i) {
				fn.call(element, new APRElement(element), i, this);
			});

			return this;

		},
		'changeCss' : function (styles) {

			if (!APR.is(styles, {})) {
				throw new TypeError(styles + ' must be a key-value object.');
			}

			APR.eachElement(this, function (element) {

				APR.eachProperty(styles, function (value, name) {
					element.style[name] = value;
				});

			});

			return this;

		},
		/**
		 * @example
		 * APRElement('body, html').chain('classList.add')('a', 'b').setText('c');
		 * // Same as:
		 * // APRElement('body, html').each(function (element) {
		 * //     this.classList.add('a');
		 * //     this.classList.add('b');
		 * // }).setText('c');
		 * 
		 * @example <caption>If you want the returned values, you can access to the `results` property:</caption>
		 * APRElement('body, html').chain('classList.contains')('someClass').results;
		 * // returns [APR.body.classList.contains('someClass'), APR.html.classList.contains('someClass')]
		 * 
		 */
		'chain' : function (property) {

			var propertyPath, fn;

			if (APR.is(property, 'function')) {
				fn = property;
			}
			else {
				propertyPath = APR.get(property, APR.get(property, 'string').split('.'));
			}
			
			return function (arg) {

				var args = arguments;
				var results = APRElement.eachElement(this, function (element) {
					return (fn || APR.access(element, propertyPath)).apply(this, args);
				});

				this.results = APR.getFirstOrMultiple(results);

				return this;

			}.bind(this);

		},
		'setText' : function (text) {

			text = APR.get(text, 'string');
			
			APR.eachElement(this, function (element) {
			
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

			APR.eachElement(this, function (element) {

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

			this.each(function (element) {
				element.isVisible() && element.isInsideBounds();
			});
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

			if (!APR.is(attributes, {})) {
				throw new TypeError(attributes + ' must be a key-value object.');
			}

			APR.eachElement(this, function (element) {

				APR.eachProperty(attributes, function (value, name) {
					
					var namespace = name.split(/^[\w\-]+\:/)[1];
					var namespaceURI = APRElement.prototype.NAMESPACES[namespace];

					if (namespaceURI) {
						this.setAttributeNS(namespaceURI, name, value);
					}
					else {
						this.setAttribute(name, value);
					}

				}, element);

			});

			return this;

		},
		'replaceAttributes' : function (attributes, allowEmptyValues) {

			APR.eachElement(this, function (element) {

				APR.eachProperty(attributes, function (newName, name) {
					
					var value = this.getAttribute(name) || '';
					
					if (!value && !allowEmptyValues) {
						return;
					}

					this.setAttribute(newName, value);
					this.removeAttribute(name);

				}, element);

			});

			return this;

		},
		'removeAttributes' : function (attribute) {
		
			var attributes = arguments;

			APR.eachElement(this, function (element) {

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
		'appendTo' : function (parent) {

			APR.eachElement(this, function (child) {	
				this.appendChild(child);
			}, parent);

			return this;

		},
		'clone' : function (options) {

			var deep = APR.get((options = APR.get(options, {})).deep, true);
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

			options = APR.get(options, {});

			APR.eachElement(this, function (element) {

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

				var parentNode;

				while (
					(parentNode = (parentNode || element).parentNode) &&
					(parentNode.nodeType && parentNode.nodeType !== Node.DOCUMENT_NODE || (parentNode = null)) &&
					!fn.call(parentNode)
				);
				
				return parentNode;

			});

			return APR.getFirstOrMultiple(results);
		
		}
	}, (function () {

		var properties = APR.createPrivateKey();

		return {
			'accessToProperty' : function (path, fn) {
				
				APR.eachElement(this, function (element) {
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

				APR.eachElement(this, function (element) {
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