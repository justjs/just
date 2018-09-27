APR.Define('APR.Element', APR).requires({
	'0.APR.Event' : APR.self.setFileUrl('APREvent', 'js'),
	'1.APR.State' : APR.self.setFileUrl('APRState', 'js')
}, function (APREvent, APRState) {

	'use strict';

	function APRElement (element) {
		
		if (!APR.is(this, APRElement)) {
			return new APRElement(element);
		}

		this.element = element;

		APRState.call(this, element);
	
	}

	function APRElementCollection (elements) {

		if (!APR.is(this, APRElementCollection)) {
			return new APRElementCollection(elements);
		}

		this.elements = elements;
		this.length = this.elements.length;

	}

	APRElementCollection.prototype = Object.assign(APRElementCollection.prototype, {

		'each' : function each (fn) {

			APR.eachElement(this.elements, function (element, i) {
				fn.call(element, i, this);
			});

			return this;

		},
		'get' : function getItem (i) {
			return this.elements[i];
		}

	}, {'constructor' : APRElementCollection});

	APRElement.prototype.SUPPORTED_NAMESPACES = {
		'html' : 'http://www.w3.org/1999/xhtml',
		'mathml' : 'http://www.w3.org/1998/Math/MathML',
		'svg' : 'http://www.w3.org/2000/svg',
		'xlink' : 'http://www.w3.org/1999/xlink',
		'xml' : 'http://www.w3.org/XML/1998/namespace',
		'xmlns' : 'http://www.w3.org/2000/xmlns/',
		'xbl' : 'http://www.mozilla.org/xbl',
		'xul' : 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'
	};

	Object.assign(APRElement, {
		'createElement' : createElementFromString,
		'findAllByState' : function () {
			return new APRElementCollection(APRState.findElementsByState.apply(null, arguments));
		},
		'findAll' : function (selector, parent) {
			return new APRElementCollection(APR.getElements(selector, parent));
		},
		'find' : function (selector, parent) {
			var elements = APR.getElements(selector, parent);
			return new APRElement(elements.length ? elements[0] : elements);
		},
		'autoresizeTextarea' : function (textarea) {

			if (!APR.is(textarea.tagName, /^textarea$/i)) {
				throw new TypeError('The given element is not a textarea.');
			}

			textarea.style.height = 'auto';
			textarea.style.height = textarea.scrollHeight + 'px';

			return textarea;

		}
	});

	APRElement.prototype = Object.assign(Object.create(APRState.prototype), APRElement.prototype, {
		
		'get' : function () {
			return this.element;
		},
		'changeCSS' : function changeCSS (styles) {

			var element = this.element;

			APR.eachProperty(styles, function (value, name) {
				element.style[name] = value;
			});

			return this;

		},
		'getCSS' : function getCSS (propertyName) {
			var element = this.element;
			return (element.currentStyle || window.getComputedStyle(element))[propertyName];
		},
		'setText' : function setText (text) {

			var element = this.element;
			
			text = APR.get(text, '');

			if ('textContent' in element) {
				element.textContent = text;
			}
			else if ('innerText' in element) {
				element.innerText = text;
			}

			return this;

		},
		'getText' : function getText () {

			var element = this.element;

			return (
				'textContent' in element ? element.textContent :
				'innerText' in element ? element.innerText :
				''
			);

		},
		'getClosestText' : function getClosestText (_wasInitialized) {
			var element = _wasInitialized ? this.element : this.element.firstChild;
			return element ? (element.nodeType === 3 ? this.getText() : '') + APRElement(element.nextSibling).getClosestText(true) : '';
		},
		/**
		 *  
		 *	@returns {object} top, left, right, bottom,
		 *		width, height, x and y
		 *
		 */
		'getBounds' : function getBounds () {

			var element = this.element;
			var bounds;
			var elementBounds;

			if (APR.is(element, 'window')) {
				return _getWindowBounds();
			}
			else if (APR.is(element.tagName, /^html$/i)) {
				return _getDocumentBounds();
			}

			try {
				bounds = element.getBoundingClientRect();
			}
			catch (exception) {/* unspecified error IE11 (?) */}

			return _createBounds(bounds, {
				'width' : bounds.width || (bounds.right - bounds.left),
				'height' : bounds.height || (bounds.bottom - bounds.top)
			});

		},
		'isInsideBounds' : function isInsideBounds (bounds) {

			var elementBounds = this.getBounds();

			return (
				elementBounds.bottom > 0 &&
				elementBounds.right > 0 &&
				elementBounds.left < bounds.width &&
				elementBounds.top < bounds.height
			);

		},
		'fitInBounds' : function fitInBounds (bounds) {

			var element = this.element;
			var ratio = Math.min(bounds.width / element.width, bounds.height / element.height);

			element.width *= ratio;
			element.height *= ratio;

			return this;

		},
		'isVisible' : function isVisible () {
			
			var bounds = this.getBounds();

			return !this.isHidden() && !!(bounds.width || bounds.height);

		},
		'isOnScreen' : function isOnScreen () {
			return this.isVisible() && this.isInsideBounds(_getWindowBounds());
		},
		'getAttributes' : function getAttributes () {
		
			var attributes = {};

			APR.eachProperty(this.element.attributes, function (attribute) {
				attributes[attribute.name || attribute.nodeName] = attribute.value || attribute.nodeValue;
			});

			return attributes;

		},
		'setAttributes' : function setAttributes (attributes) {

			var element = this.element;

			APR.eachProperty(attributes, function (value, name) {
				
				var namespace = name.split(/^[\w\-]+\:/)[1];
				var namespaceURI = APRElement.prototype.SUPPORTED_NAMESPACES[namespace];

				if (namespaceURI) {
					element.setAttributeNS(namespaceURI, name, value);
				}
				else {
					element.setAttribute(name, value);
				}

			});

			return this;

		},
		'replaceAttributes' : function replaceAttributes (attributes, allowNullValues) {

			var element = this.element;

			APR.eachProperty(attributes, function (newName, name) {
				
				var value = element.getAttribute(name) || '';
				
				if (!value && !allowNullValues) {
					return;
				}

				element.setAttribute(newName, value);
				element.removeAttribute(name);

			});

			return this;
		},
		'removeAttributes' : function removeAttributes () {
		
			var element = this.element;

			APR.eachElement(arguments, function (name) {
				element.removeAttribute(name);
			});

			return this;

		},
		'cloneAttributes' : function cloneAttributes (target) {
			return this.element.setAttributes(APRElement(target).getAttributes());
		},

		'find' : function findOneElement (selector) {
			return APRElement.find(selector, this.element);
		},
		'findAll' : function findAllElements (selector) {
			return APRElement.findAll(selector, this.element);
		},
		'appendTo' : function appendElementToParent (parent) {
			parent.appendChild(this.element);
			return APRElement(parent);
		},
		'append' : function appendElement (child) {
			this.element.appendChild(child);
			return this;
		},
		'delete' : function deleteElement () {
			var element = this.element;
			element.parentNode.removeChild(element);
			return this;
		},
		'clone' : function cloneElement (options) {
			return APRElement(this.element.cloneNode(true));
		},
		'removeChildren' : function removeChildren () {

			var element = this.element;

			while (this.hasChilds()) {
				element.removeChild(element.firstChild);
			}

			return this;

		},
		'hasChilds' : function hasChilds () {
			return !!this.element.firstChild;
		},
		'getChildren' : function getChildren () {
			return APRElement(this.element.children);
		},
		'isHidden' : function isHidden () {
			var element = this.element;
			return element.parentNode === null || element.getAttribute('hidden') !== null;
		},
		'replaceWith' : function replaceElement (newElement) {

			newElement.appendTo(this.element.parentNode);
			this.delete();

			return newElement;

		},
		'replaceTag' : function replaceTag (tagName) {
		
			var element = this.element;

			return this.replaceElement(createElementFromString(tagName)
				.cloneAttributes(element)
				.cloneEvents(element)
				.cloneProperties(element)
				.cloneStates(element)
			);
		},
		'isCSSPropertySupported' : function isCSSPropertySupported (cssProperty) {
			var gcs = window.getComputedStyle;
			return APR.is(gcs, 'function') && !APR.is(gcs(APR.body)[cssProperty], 'undefined');
		},
		'getRemoteParent' : function getRemoteParent (fn) {
			
			var parentNode;

			while (
				(parentNode = (parentNode || this.element).parentNode) &&
				(parentNode.nodeType && parentNode.nodeType !== Node.DOCUMENT_NODE || (parentNode = null)) &&
				!fn.call(parentNode)
			);
			
			return parentNode;
		
		}
	}, (function () {

		var _ = APR.createPrivateKey();

		return {
			'accessToProperty' : function accessToProperty (path, fn) {
				APR.access(_(this.element), path, fn);
				return this;
			},
			'setProperty' : function setProperty (path, value) {
				this.accessToProperty(path, function (lastProperty) {
					this[lastProperty] = value;
				});
				return this;
			},
			'getProperty' : function getProperty (path) {
				return this.accessToProperty(path, function (lastProperty, exists) {
					return exists ? this[lastProperty] : void 0;
				});
			},
			'hasProperty' : function hasProperty (path) {
				return this.accessToProperty(path, function (lastProperty, exists) {
					return exists;
				});
			},
			'removeProperty' : function removeProperty (path) {
				this.accessToProperty(path, function (lastProperty) {
					delete this[lastProperty];
				});
				return this;
			},
			'getAllProperties' : function getAllProperties () {
				return Object.assign({}, _(this.element));
			},
			'cloneProperties' : function cloneProperties (target) {
				Object.assign(_(target), this.getAllProperties());
				return this;
			}
		};

	})(), {'constructor' : APRElement});

	function _createElement (tagName, namespace) {

		var supportedNamespaces = APRElement.prototype.SUPPORTED_NAMESPACES;
		var namespaceURI = supportedNamespaces[namespace] || supportedNamespaces[tagName] || namespace;
		var element;

		tagName = tagName.toLowerCase();

		element = namespaceURI
			? document.createElementNS(namespaceURI, tagName)
			: document.createElement(tagName);

		return new APRElement(element);

	}

	function _createBounds (position, size) {

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

	}

	function createElementFromString (elementAsString) {

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

		element = _createElement(tagName, namespace);

		// FIX: Backreference didn't work on quotes. 
		attributes = attributes.replace(/\[\s*([\w\-\:]+)(\s*\=\s*(\"([^\"]*)\"|\'([^\"]*)\')\s*)?\]/g, function replaceAttribute (regexp, name, quoted, attributeValue, valueDoubleQuotes, valueSingleQuotes) {
			element.setAttributes(APR.setObjectProperties({}, [
				name, attributeValue ? (valueDoubleQuotes || valueSingleQuotes) : true
			]), namespace);
			return '';
		}).trim();

		attributes = attributes.replace(/\[\s*([\w\-]+)\s*\=\s*(\"(\{.+\})\"|\'(\{.+\})\')\s*\]/, function replaceJSONAttribute (_, name, value, json) {
			element.setAttributes(APR.setObjectProperties({}, [
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

	}

	function _getWindowBounds () {
		
		var html = APR.html;
		var position = {
			'x' : window.scrollX || window.pageXOffset || html.scrollLeft,
			'y' : window.scrollY || window.pageYOffset || html.scrollTop
		};
		var size = {
			'width' : window.innerWidth || html.clientWidth,
			'height' : window.innerHeight || html.clientHeight
		};

		return _createBounds(position, size);

	}

	function _getDocumentBounds () {

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

		return _createBounds(position, size);

	}
		
	if (!APR.Element) {
		APR.Element = APRElement;
	}

});