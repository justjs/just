APR.Define('APR/Element', 0.1).using({
	'0:APR/Event-0.1' : APR.self.setFileUrl('APREvent', 'js', 0.1),
	'1:APR/State-0.1' : APR.self.setFileUrl('APRState', 'js', 0.1)
}, function (APREvent, APRState) {

	'use strict';

	var ArrayProto = Array.prototype;
	var _ = Object.assign(APR.createPrivateKey(), {
		
		'getResults' : function (array, fn, CommonConstructor) {
			return APR.getFirstOrMultiple(APR.eachElement(array, fn, array));
		},
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
		else if (elements instanceof Node || APR.isWindow(elements)) {
			elements = [elements];
		}
		else if (!Array.isArray(elements)) {
			throw new TypeError(elements + ' should be either an string, an array or a Node.');
		}

		if (this.constructor === APRElement) {
			this.length = ArrayProto.push.apply(this, elements);
		}

		APRState.call(this);
	
	}

	Object.assign(APRElement, {
		'version' : this.version,
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
				element.get().id = id;
				return '';
			}).trim();

			element.setText(text);

			return element.get();

		},
		'findAllByState' : function (stateKey, parent) {
			return APRState.findElementsByState(stateKey, parent);
		},
		'findAll' : function (selector, parent) {
			return APR.getElements(selector, parent);
		},
		'find' : function (selector, parent) {
			return APR.getElements(selector, parent)[0];
		}
	});

	APRElement.prototype = Object.assign(Object.create(APRState.prototype), APRElement.prototype, {

		'get' : function (handler) {
			
			return _.getResults(this, function (element, i) {
				return typeof handler === 'function' ? handler.call(element, new APRElement(element), i, this) : element;
			});

		},
		'each' : function (fn) {
			return this.get(fn), this;
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
			return _.getResults(this, function (element) {
				return (
					'textContent' in element ? element.textContent :
					'innerText' in element ? element.innerText :
					''
				);
			});
		},
		/**
		 *  
		 *	@returns {Object} top, left, right, bottom,
		 *		width, height, x and y
		 *
		 */
		'getBounds' : function () {

			return _.getResults(this, function (element) {

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

		},
		'isInsideBounds' : function (bounds) {

			return _.getResults(this, function (target) {

				var elementBounds = new APRElement(target).getBounds();

				return (
					elementBounds.bottom > 0 &&
					elementBounds.right > 0 &&
					elementBounds.left < bounds.width &&
					elementBounds.top < bounds.height
				);

			});

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

			return _.getResults(this, function (element) {
				var bounds = element.getBounds();
				return !APRElement(element).isHidden() && !!(bounds.width || bounds.height);
			});

		},
		'isOnScreen' : function () {

			return _.getResults(this, function (target) {
				var element = new APRElement(target);
				return element.isVisible() && element.isInsideBounds(_.getWindowBounds());
			});

		},
		'getAttributes' : function () {
				
			return _.getResults(this, function (target) {

				var attributes = {};

				APR.eachProperty(target.attributes, function (attribute) {
					attributes[attribute.name || attribute.nodeName] = attribute.value || attribute.nodeValue;
				});

				return attributes;
			
			});

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

			return new APRElement(_.getResults(this, function (parent) {
				return APRElement.find(selector, parent);
			}));

		},
		'findAll' : function (selector) {

			return new APRElement(_.getResults(this, function (parent) {
				return APRElement.findAll(selector, parent);
			}));

		},
		'findAllByState' : function (stateKey) {

			return new APRElement(_.getResults(this, function (parent) {
				return APRElement.findAllByState(stateKey, parent);
			}));

		},
		'clone' : function (options) {

			var deep = APR.defaults((options = APR.defaults(options, {})).deep, true);
			
			return new APRElement(_.getResults(this, function (target) {

				return new APRElement(target.cloneNode(deep)).copy(target, {
					'doNotCopyAttributes' : true,
					'doNotCopyText' : true
				}).get();

			}));

		},
		'remove' : function () {
			
			ArrayProto.forEach.call(this, function (target) {
				target.parentNode.removeChild(target);
			});

			return this;

		},
		'removeChildren' : function () {

			ArrayProto.forEach.call(this, function (target) {

				while (target.firstChild) {
					target.removeChild(target.firstChild);
				}

			});

			return this;

		},
		'isHidden' : function () {
			return _.getResults(this, function (target) {
				return target.parentNode === null || target.getAttribute('hidden') !== null;
			});
		},
		'replaceWith' : function (newElement) {

			return new APRElement(_.getResults(this, function (target) {
				
				target.parentNode.replaceChild(newElement, target);
				
				return newElement;

			}, APRElement));

		},
		'copy' : function (target, options) {

			options = APR.defaults(options, {});

			ArrayProto.forEach.call(this, function (element) {

				element = APRElement(element);

				if (!options.doNotCopyAttributes) {
					element.cloneAttributes(target);
				}

				if (!options.doNotCopyEvents) {
					element.cloneEvents(target);
				}

				if (!options.doNotCopyProperties) {
					element.cloneProperties(target);
				}

				if (!options.doNotCopyText) {
					element.setText(APRElement(target).getText());
				}

			});

			return this;

		},
		'replaceTag' : function (tagName, copyOptions) {
			
			return new APRElement(_.getResults(this, function (target) {

				var newElement = new APRElement(APRElement.createElement(tagName)).copy(target, copyOptions).get();
				
				return new APRElement(target).replaceWith(newElement).get();

			}));

		},
		'getRemoteParent' : function (fn) {
			
			return new APRElement(_.getResults(this, function (element) {
				return APR.getRemoteParent(element, fn);
			}));
	
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

				return _.getResults(this, function (element) {
					return Object.assign({}, properties(element));
				});

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