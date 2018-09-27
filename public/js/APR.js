(function (W, D, O, S, A, F, E, T) {
	// ie8
	'use strict';

	function fp(c,p,f){c[p]=c[p]||f}
	function fl(o){/* mozilla & github/jonathantneal/polyfill */var _=[];fp(o,'addEventListener',function(t,l){var s=this,fa=function(s,t,f){s.attachEvent('on'+t,f);_.push({s:s,t:t,l:l,f:f})},f1=function(e){var h=l.handleEvent,H=D.documentElement;e=e||W.event;fp(e,'target',e.srcElement||s);fp(e,'currentTarget',s);fp(e,'relatedTarget',e.fromElement);fp(e,'timeStamp',+new Date());fp(e,'pageX',e.clientX+H.scrollLeft);fp(e,'pageY',e.clientY+H.scrollTop);h?h(e):l.call(s,e)},f2=function(e){if(D.readyState!='complete'){if(e!=0)return f1(e);e=new Event(t);e.srcElement=W;f2(e)}};t!='DOMContentLoaded'?fa(s,t,f1):fa(D,'readystatechange',f2),f2(0)});fp(o,'removeEventListener',function(t,l){var i=_.length,h;while(--i>=0)if((h=_[i]).s==this&&h.t==t&&h.l==l&&h.s.detachEvent('on'+(t=='DOMContentLoaded'?'readystatechange':t),h.f))break})}
	function fy(o){return o.prototype}
	function ff(o,f){for(var k in o)o.hasOwnProperty(k)&&f(k,o[k])}
	function fg(o,p,g){O.defineProperty?O.defineProperty(o,p,{get:g}):o.__defineGetter__(p,g)};

	E=!fy(E)||!fy(E).constructor.name?function(t,o){var e,b,c;o=o&&typeof o=='object'?o:{};b=!!o.bubbles;c=!!o.cancelable;if('createEvent' in D)return(e=D.createEvent('Event')).initEvent(t,b,c),e;e=D.createEventObject();e.type=t;e.bubbles=b;e.cancelable=c;return e}:Event;
	W.CustomEvent=W.CustomEvent&&typeof W.CustomEvent=='object'?function(t,o){var e=D.createEvent('CustomEvent');o=o&&typeof o=='object'?o:{};e.initCustomEvent(t,!!o.bubbles,!!o.cancelable,o.detail);return e}:W.CustomEvent||function(t,o){var e=new Event(t,o);e.detail=(o&&typeof o=='object'?o:{}).detail;return e};

	fp(W,'WeakMap',function(){var s={},i=0,t=fy(this);t.set=function(k,v){s[k.__WeakMapID=i++]=v};t.get=function(k){return s[k.__WeakMapID]};t.has=function(k){return k._id in s};t.delete=function(k){delete s[k.__WeakMapID]}});
	fp(Number,'isNaN',function(v){return v!==v});
	
	fp(O,'assign',function(){var r={};ff(arguments,function(k,v){r[k]=v});return r});
	fp(O,'create',function(p,_){function fn(){}fn.prototype=p;return new fn()});
	fp(O,'keys',function(o){var r=[];ff(o,function(k){k.push(k)});return r});

	fp(fy(S),'trim',function(){/* mozilla */return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,'')});
	fp(fy(A),'filter',function(fn){var i=0,f=this.length>>>0,r=[],v;for(;i<f;i++)fn((v=this[i]),i,this)&&r.push(v);return r});
	fp(fy(A),'indexOf',function(k,i){var f=this.length>>>0;i=i<<0;for(i+=i<0?f:0;i<f;i++)if(this[i]===k)return i;return -1});
	fp(fy(A),'from',function(a,fn,t){var s=this,l=Object(a),f=l.length>>>0,r=typeof s=='function'?Object(new s(f)):new Array(f),i=-1;while(++i<f)r[i]=fn?fn.call(t,l[i],i):l[i];r.length=f;return r});
	fp(fy(F),'bind',function(T){var a=fy(A).slice.call(arguments,1),b=this,fa=function(){},fb=function(){return b.apply(this instanceof fa?this:T,a.concat(fy(A).slice.call(arguments)))};fa.prototype=fy(this);fb.prototype=new fa();return fb});
	fp(fy(F),'some',function(f,_){/* mozilla */var t=this,i=t.length>>>0;while(--i>=0){if(i in t&&f.call(_,t[i],i,t))return !0}return !1});
	fp(fy(E),'preventDefault',function(){this.cancelable&&(this.returnValue=!1)});
	fp(fy(E),'stopPropagation',function(){this.cancelBubble=!0});
	fp(fy(E),'stopImmediatePropagation',function(){this.cancelBubble=this.cancelImmediate=!0});
	fp(Location,'origin',function(){return this.protocol+'//'+this.host});
	fp(Location,'toString',function(){return this.href});

	if (!fy(T).addEventListener) fl(fy(Window)), fl(fy(T)), fl(fy(HTMLDocument));

	ff((function(fs){return{previousElementSibling:function(){return fs(this,'previous')},nextElementSibling:function(){return fs(this,'next')}}})(function fs(e,k){while((e=e[k+'Sibling'])&&e.nodeType!=1);return e}),function(k,v){(v in D.documentElement)||fg(fy(T),k,v)});

	!function (g) {

		var fs=function(t){return fy(A).join.call(t,' ')},
			fi=function(t,s){return (' '+fs(t)+' ').indexOf(' '+s+' ')},
			fv=function(s){if(!(s=s+'')||/\s/.test(s))throw Error('"'+s+'" is invalid');return s},
			ft=function(s,f){var t=this;return t.contains(s)?(f===!1&&t.remove(s),!1):(f===!0&&t.add(s),!0)},
			fe=function(){return fy(A).filter.call(this,function(v,k){return !isNaN(k)})},
			fc=function(s){return !/\s/.test(s)&&fi(this,s)>=0},
			fr=function(a,b){var t=this;if(!b)throw TypeError('Not enough arguments');return t.contains(a=fv(a))&&(b=fv(b))&&(t.remove(a),t.add(b),!0)},
			fh=function(f,s){var t=this;ff(fe.call(t),function(k,v){f.call(s,v,+k,t)})},
			fk=function(){return O.keys(fe.call(this))},
			fT=function(e) {
				
				var t=this;
				
				t.value=(e.getAttribute('class')||'').trim();
				t.length=t.value?fy(A).push.apply(t,t.value.split(/\s+/)):0;
				t.element=e;
				fy(fT).toString=function(){return fs(this)};
				fy(fT)._values=fy(fT)._entries=fe;
				fy(fT)._keys=fk;

			},
			_=D.createElementNS('http://www.w3.org/2000/svg','g'),
			p='classList';

		fp(W,g,fT);

		(p in _)||fg(fy(T),p,function(){return new W[g](this)});

		fp(fy(fT),'add',function(){var t=this,a=arguments,i,s;for(i=0;i<a.length;i++)t.contains(s=fv(a[i]))||(fy(A).push.call(t,s),t.element.setAttribute('class',fs(t)))});
		fp(fy(fT),'remove',function(){var t=this,a=arguments,i=a.length,s;while(--i>=0)if(t.contains(s=fv(a[i]))){fh.call(t,function(v,k){v===s&&fy(A).splice.call(t,k,1)});t.element.setAttribute('class',fs(t))}});
		fp(fy(fT),'item',function(i){return this[i]||null});
		fp(fy(fT),'contains',fc);
		fp(fy(fT),'replace',fr);
		fp(fy(fT),'toggle',ft);
		fp(fy(fT),'forEach',fh);

		_[p].add('a','b');
		_[p].contains('b')||(fy(W[g]).contains=fc);
		_[p].toggle('c',!1)||(fy(W[g]).toggle=ft);

		_=null;

	}('DOMTokenList');

})(window, document, Object, String, Array, Function, Event, Element, Location);

(function (callback) {

	'use strict';

	var body = getElements('body')[0],
		head = getElements('head')[0],
		html = document.documentElement || body.parentNode,
		DNT = (function () {

			var dnt = [navigator.doNotTrack, navigator.msDoNotTrack, window.doNotTrack];
			var consent = ',' + dnt + ',';

			return has(consent, /,(yes|1),/i) ? 1 : has(consent, /,(no|0),/i) ? 0 : void 0;

		})(),
		APRDefine = (function () {

			var _ = _createPrivateProperties();

			function _createPrivateProperties () {
				return {
					'urls' : {},
					'knownModules' : {},
					'dependencies' : {},
					'isReady' : false,
					'numModules' : 0
				};
			}

			function _getModule (moduleKey) {
							
				var scope = _getModuleScope(moduleKey);
				var name = _getModuleName(moduleKey);

				if (!is(scope, Object) || is(scope[name], 'undefined')) {
					return null;
				}

				return scope[name];
			
			}

			function _callModule (moduleKey) {

				var knownModules = _.knownModules[moduleKey];
				var dependencies = _.dependencies[moduleKey];
				var params;

				if (!knownModules && !dependencies) {
					throw new TypeError('"' + moduleKey + '" was defined but it doesn\'t exist in the given scope.');
				}

				params = eachElement(dependencies, function convertStringToModule (key) {
					return _getModule(key) || _callModule(key);
				}).filter(function (withValue) {
					return withValue;
				});

				if (params.length !== dependencies.length) {
					return null;
				}

				knownModules.handler.apply(knownModules.scope, params);
				
				eachProperty(_.knownModules, function removeKeyCoincidences (knownModule, key) {
					
					var i = knownModule.pending.indexOf(moduleKey);
					var params;

					if (i < 0) {
						return;
					}

					knownModule.pending.splice(i);

					if (!knownModule.pending.length) {
						_callModule(key);
					}

				});

				delete _.knownModules[moduleKey];
				delete _.dependencies[moduleKey];

				return _getModule(moduleKey);

			}

			function _onDependenciesLoaded () {

				eachProperty(_.dependencies, function removeModules (modules, moduleKey) {

					_.knownModules[moduleKey].pending = modules = modules.filter(function removeUnknowns (key) {
						return _.knownModules[key] || !_getModule(key) && (function () {
							throw new TypeError("'" + key + "' is undefined.");
						})();
					});

					if (!modules.length) {
						_callModule(moduleKey);
					}

				});

			}

			function _getModuleScope (moduleKey) {
				var knownModule = _.knownModules[moduleKey];
				var givenScope = _getGivenModuleScope(moduleKey);
				return knownModule ? knownModule.scope
					: givenScope ? window[givenScope]
					: window;
			}

			function _getGivenModuleScope (moduleKey) {
				var i = moduleKey.indexOf('.');
				return i >= 0 ? moduleKey.slice(0, i) : null;
			}

			function _getModuleName (moduleKey) {
				return moduleKey.slice(moduleKey.lastIndexOf('.') + 1);
			}

			function _initModule (moduleKey, scope, modules, handler) {

				if (!is(handler, 'function')) {
					throw new TypeError('"' + handler + '" must be a function.');
				}

				if (!(scope = scope || _getModuleScope(moduleKey))) {
					throw new Error('"' + _getGivenModuleScope(moduleKey) + '" is undefined.');
				}

				_.knownModules[moduleKey] = {
					'scope' : scope,
					'handler' : handler,
					'pending' : []
				};

				if (is(modules, [])) {
					_.dependencies[moduleKey] = modules;
				}
				else if (is(modules, {})) {

					_.dependencies[moduleKey] = [];

					eachProperty(modules, function (url, key) {
						
						var parts = key.match(/(\d+)\.(.+)/) || [];
						var keyOrder = +parts[1];
						var keyName = parts[2];

						if (is(keyOrder, NaN)) {
							throw new TypeError('The key "' + key + '" must be prefixed with a number and a dot, to indicate the order in which the parameters will be called.\nI.e.: {1.a: "url", 0.b: "another url"} -> function (b, a) {}.');
						}

						APRDefine.load(setObjectProperties({}, [keyName, url]));

						_.dependencies[moduleKey].push(keyName);

					});

				}
				else {
					throw new TypeError('"' + modules + '" must be an object.');
				}

			}

			function _onFinish () {
				_ = _createPrivateProperties();
			}

			function APRDefine (moduleKey, scope) {

				return {
					'init' : _initModule.bind(this, moduleKey, scope, []),
					'requires' : _initModule.bind(this, moduleKey, scope)
				};

			}

			APRDefine.load = function (urls) {

				var customAppend = function checkForUrlErrors () {

					this.onload = function () {

						this.onload = null;
						this.onerror = null;

						if (--_.numModules <= 0) {
							_onDependenciesLoaded();
						}

					};
					this.onerror = function () {
						throw new Error('There was an error trying to load a script with the next url: ' + this.src);
					};
					
					head.appendChild(this);
					_.numModules++;

				};

				if (!is(urls, {})) {
					throw new TypeError('"' + urls + '" must be a key-value object.');
				}

				_.isReady = false;
				_.urls = Object.assign(_.urls, urls);

				eachProperty(urls, function loadFiles (url, moduleKey) {
					loadFile(url, null, {'customAppend' : customAppend});
				});

			};

			return APRDefine;

		})();

	// based on https://philipwalton.com/articles/implementing-private-and-protected-members-in-javascript/
	function createPrivateKey (factory, proto) {
				
		var store = new WeakMap();
		var seen = new WeakMap();

		if (!is(factory, 'function')) {
			factory = Object.create.bind(null, factory || Object.prototype);
		}

		return function (key) {

			var value;

			if (!is(key, Object)) {
				return;
			}

			if (is(key, 'window')) {
				key = Window;
			}

			if (value = store.get(key)) {
				return value;
			}

			if (seen.has(key)) {
				return key;
			}
			
			value = factory(key);
			store.set(key, value);
			seen.set(value, true);

			return value;

		};

	}

	function getElements (selector, parent) {
		return Array.from((parent || document).querySelectorAll(selector));
	}

	function isArray (array) {
		return Object.prototype.toString.call(array) === '[object Array]';
	}

	function has (subject, type) {
		return (type instanceof RegExp ? type : new RegExp(type + '')).test(subject);
	}

	function is (subject, type) {

		if (type instanceof RegExp) {
			return has(subject, type);
		}

		if (has(type, /^window$/i)) {
			return _isWindow(subject);
		}

		if (subject === type) {
			return true;
		}

		if (inArray([null, NaN, Infinity, -Infinity], type)) {
			return type === subject;
		}

		if (type instanceof Function) {
			return subject instanceof type;
		}

		if (is((type + '').trim(), /^(undefined|string|object|symbol|function|number|boolean)$/i)) {
			return typeof subject === type.toLowerCase().trim();
		}

		if (isArray(type)) {
			return isArray(subject);
		}

		return typeof type === typeof subject;

	}

	function get (subject, type) {
		return !is(subject, type) ? type : subject;
	}

	function eachElement (array, fn) {
		
		var i, f;
		var r = [];

		if (!is(fn, 'function')) {
			throw new TypeError("\"" + fn + "\" is not a function.");
		}

		for (i = 0, f = array.length; i < f; i++) {
			r[i] = fn.call(array, array[i], i);
		}

		return r;

	}

	function setObjectProperties (object, properties) {

		var i, f, key, value;

		for (i = 0, f = properties.length - 1; i < f; i += 2) {
			key = properties[i];
			value = properties[i + 1];
			object[key] = value;
		}

		return object;

	}

	function stringToJSON (string) {
		
		var json;

		try {
			json = JSON.parse(string) || {};
		}
		catch (exception) {
			return {}
		}

		return json;

	}

	function onDocumentReady (fn) {
		
		var isReady = function () {
			return document.readyState === 'complete';
		};
		var handler = function (e) {

			if (isReady()) {
				fn();
				this.removeEventListener(e.type, handler, false);
			}

		};

		if (isReady()) {
			return fn();
		}

		document.addEventListener(('DOMContentLoaded' in document ? 'DOMContentLoaded' : 'readystatechange'), handler, false);

	}

	function inArray (array, value) {
		return array.some(function (v) {
			return value === v || (Number.isNaN(value) && Number.isNaN(v));
		});
	}

	function eachProperty (properties, fn) {

		var k;

		for (k in properties) {
			
			if (properties.hasOwnProperty(k)) {
				fn.call(this, properties[k], k);
			}

		}

	}

	function getUniqueString (haystack) {
		
		var maxRecursions = 10;

		return (function generateUniqueString (string, i) {

			var uniqueString = getRandomString(4 * i);

			if (i <= maxRecursions && has(string, uniqueString)) {
				uniqueString = generateUniqueString(string, i + 1);
			}

			return uniqueString;

		})(haystack || '', 1);
	
	}

	function getRandomString (length) {

		var crypto = window.crypto || window.msCrypto;
		var charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_';
		var charsetLength = charset.length;
		var randomString = '';

		try { // secure; https://stackoverflow.com/questions/10051494/oauth-nonce-value
			
			eachElement(crypto.getRandomValues(new Uint8Array(length)), function (c) {
				randomString += charset[c % charsetLength];
			});

		} catch (exception) { // non-secure; https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
			while (--length >= 0) {
				randomString += charset[Math.floor(Math.random() * charsetLength)];
			}
		}

		return randomString;

	}

	function access (object, path, handler) {

		var existsProperty = true;

		path = get(path, [path]);

		eachElement(path, function (value) {
			object = object[value] || ((existsProperty = false), {});
		});

		return handler ? handler.call(object, path[path.length - 1], existsProperty) : object;

	}

	function isTouchDevice () {

		var isTouch = 'ontouchstart' in body
			|| navigator.maxTouchPoints > 0
			|| navigator.msMaxTouchPoints > 0;

		return isTouch;

	}

	function loadFile (src, callback, options) {

		var loadedElement = getElements('[src="' + src + '"], [src="' + parseUrl(src).href + '"]')[0];
		var onLoad = function onLoad (e) {

			if (e !== null) {
				this.onerror = null;
				this.onload = null;
			}

			if (is(callback, 'function')) {
				callback(this);
			}

		};
		var element;

		options = get(options, {});

		if (loadedElement) {
			onLoad.call(loadedElement, null);
			return;
		}

		if (/\.js/i.test(src)) {
			element = document.createElement('script');
			element.onload = onLoad;
			element.src = src;
		}
		else if (/\.css/i.test(src)) {
			element = document.createElement('link');
			element.rel = 'stylesheet';
			element.onload = onLoad;
			element.href = src;
		}
		else {
			throw new TypeError('"' + src + '" has an invalid extension.');
		}

		if (parseUrl(element.src).origin !== window.location.origin) {
			element.setAttribute('crossorigin', 'anonymous');
		}

		if (is(options.customAppend, 'function')) {
			options.customAppend.call(element);
		}
		else {
			head.appendChild(element);
		}

	}

	function parseUrl (url) {
		
		var parts = {}, optionalParts, hrefParts, args, id, uriParts, domainParts, hostParts, userParts, passwordParts;
		var location = window.location;
		var blob;

		if (APR.has(url, /^blob\:/i)) {
			blob = parseUrl(url.replace(/^blob\:/i, ''));
			return Object.assign(blob, {
				'protocol' : 'blob:',
				'href' : 'blob:' + blob.href,
				'host' : '',
				'hostname' : '',
				'port' : '',
				'pathname' : blob.origin + blob.pathname
			});
		}

		if (APR.has(url, /^(\:)?\/\//)) {
			url = location.protocol + url.replace(/^\:/, '');
		}
		else if (APR.has(url, /^(\?|\#|\/)/)) {
			url = location.origin + url;
		}
		else if (!APR.has(url, /\:\/\//)) {
			url = location.protocol + '//' + url;
		}

		hrefParts = url.split(/(\?.*#?|#.*\??).*/);
		optionalParts = (hrefParts[1] || '').split('#');
		id = optionalParts[1] || '';

		parts.search = optionalParts[0] || '';
		parts.hash = id ? '#' + id : id;

		uriParts = (hrefParts[0] || '').split('://');

		hostParts = (uriParts[1] || '').split(/(\/.*)/);
		
		parts.username = '';
		parts.password = '';

		if (APR.has(hostParts[0], '@')) {
			userParts = hostParts[0].split('@');
			passwordParts = userParts[0].split(':');
			parts.username = passwordParts[0] || '';
			parts.password = passwordParts[1] || '';
			hostParts[0] = userParts[1];
		}

		parts.host = hostParts[0] || '';
		parts.pathname = hostParts[1] || '/';

		domainParts = parts.host.split(':');
		
		parts.hostname = domainParts[0] || '';
		parts.port = domainParts[1] || '';

		parts.protocol = uriParts[0] + ':';
		parts.origin = parts.protocol + '//' + parts.host;

		parts.href = (userParts
			? parts.protocol + '//' + parts.username + ':' + parts.password + '@' + parts.host
			: parts.origin
		) + parts.pathname + parts.search + parts.hash;

		return parts;

	}

	function getFunctionName (fn) {

		var matches;

		if (!is(fn, 'function')) {
			return '';
		}

		if (fn.name) {
			return fn.name;
		}

		matches = fn.toString().match(/function([^\(]+)\(+/i);

		return matches ? matches[1].trim() : '';

	}

	function _isWindow (element) {
		return element === window || APR.is(element, {}) && element.document && element.setInterval;
	}

	window.APR = {
		'self' : Object.create({
			'originUrl' : 'https://www.apr.com',
			'staticOriginUrl' : 'https://www.shared.apr.com',
			'setFileUrl' : function (name, ext, version) {return this.staticOriginUrl + '/' + ext + '/' + name + (version ? '-' + version : '') + '.' + ext}
		}),
		'Define' : APRDefine,
		'body' : body,
		'head' : head,
		'html' : html,
		'DNT' : DNT,
		'createPrivateKey' : createPrivateKey,
		'getElements' : getElements,
		'isArray' : isArray,
		'has' : has,
		'is' : is,
		'get' : get,
		'eachElement' : eachElement,
		'parseUrl' : parseUrl,
		'setObjectProperties' : setObjectProperties,
		'stringToJSON' : stringToJSON,
		'onDocumentReady' : onDocumentReady,
		'inArray' : inArray,
		'eachProperty' : eachProperty,
		'getUniqueString' : getUniqueString,
		'getRandomString' : getRandomString,
		'access' : access,
		'isTouchDevice' : isTouchDevice,
		'loadFile' : loadFile,
		'getFunctionName' : getFunctionName
	};

	callback();

})(function () {

	var urls = {};
	
	APR.eachElement(APR.getElements('*[data-APR-define]'), function (element) {

		var url = APR.stringToJSON((element.getAttribute('data-APR-define') || '').replace(/\[([^\]]+)\]/ig, function (_, attributeName) {
			return element.getAttribute(attributeName);
		}));

		urls = Object.assign(urls, url);

	});

	APR.Define.load(urls);

});