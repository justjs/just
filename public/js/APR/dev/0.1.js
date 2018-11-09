/**
 * @file A file that defines {@link APR} as global.
 * @author Alexis Puga Ruíz (APR)
 * @version  0.1
 * @copyright Alexis Puga Ruíz 2018
 */
/**
 * Some polyfills (for ie8) used in 2 o more APR modules.
 * @ignore
 */
(function (W, D, O, S, A, F, E, T) {

	'use strict';

	function fp(c,p,f){c[p]=c[p]||f}
	function fl(o){/* source: mozilla & github/jonathantneal/polyfill */var _=[];fp(o,'addEventListener',function(t,l){var s=this,fa=function(s,t,f){s.attachEvent('on'+t,f);_.push({s:s,t:t,l:l,f:f})},f1=function(e){var h=l.handleEvent,H=D.documentElement;e=e||W.event;fp(e,'target',e.srcElement||s);fp(e,'currentTarget',s);fp(e,'relatedTarget',e.fromElement);fp(e,'timeStamp',+new Date());fp(e,'pageX',e.clientX+H.scrollLeft);fp(e,'pageY',e.clientY+H.scrollTop);h?h(e):l.call(s,e)},f2=function(e){if(D.readyState!='complete'){if(e!=0)return f1(e);e=new Event(t);e.srcElement=W;f2(e)}};t!='DOMContentLoaded'?fa(s,t,f1):fa(D,'readystatechange',f2),f2(0)});fp(o,'removeEventListener',function(t,l){var i=_.length,h;while(--i>=0)if((h=_[i]).s==this&&h.t==t&&h.l==l&&h.s.detachEvent('on'+(t=='DOMContentLoaded'?'readystatechange':t),h.f))break})}
	function fy(o){return o.prototype}
	function ff(o,f){for(var k in o)Object.prototype.hasOwnProperty.call(o,k)&&f(k,o[k])}
	function fg(o,p,g){O.defineProperty?O.defineProperty(o,p,{get:g}):o.__defineGetter__(p,g)};
	function fv(o,p){var v=['moz','webkit','ms','o'],i=v.length,fn;while(--i>=0)if(fn=o[p+v[i]])return fn}
	function fd(o){fp(o,'dispatchEvent',function(e){return this.fireEvent('on'+e.type,e)})}

	E=!fy(E)||!fy(E).constructor.name?function(t,o){var e,b,c;o=o&&typeof o=='object'?o:{};b=!!o.bubbles;c=!!o.cancelable;if('createEvent' in D)return(e=D.createEvent('Event')).initEvent(t,b,c),e;e=D.createEventObject();e.type=t;e.bubbles=b;e.cancelable=c;return e}:Event;
	W.CustomEvent=W.CustomEvent&&typeof W.CustomEvent=='object'?function(t,o){var e=D.createEvent('CustomEvent');o=o&&typeof o=='object'?o:{};e.initCustomEvent(t,!!o.bubbles,!!o.cancelable,o.detail);return e}:W.CustomEvent||function(t,o){var e=new Event(t,o);e.detail=(o&&typeof o=='object'?o:{}).detail;return e};

	fp(W,'WeakMap',function(){var s={},i=0,t=fy(this);t.set=function(k,v){s[k.__WeakMapID=i++]=v};t.get=function(k){return s[k.__WeakMapID]};t.has=function(k){return k._id in s};t.delete=function(k){delete s[k.__WeakMapID]}});
	fp(Number,'isNaN',function(v){return v!==v});

	fp(O,'assign',function(o){var a=arguments,i=a.length;o=O(o);while(--i>=1)ff(a[i],function(k,v){o[k]=v});return o});
	fp(O,'create',function(p,_){function fn(){}fn.prototype=p;return new fn()});
	fp(O,'keys',function(o){var r=[];ff(o,function(k){r.push(k)});return r});
	fp(O,'values',function(o){var r=[];ff(o,function(k,v){r.push(v)});return r});
	fp(A,'isArray',function(a){return fy(O).toString.call(a)==='[object Array]'});
	fp(A,'from',function(a,fn,t){var s=this,l=O(a),f=l.length>>>0,r=typeof s=='function'?O(new s(f)):new Array(f),i=-1;while(++i<f)r[i]=fn?fn.call(t,l[i],i):l[i];r.length=f;return r});

	fp(fy(S),'trim',function(){/* source: mozilla */return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,'')});
	fp(fy(A),'filter',function(fn){var i=0,f=this.length>>>0,r=[],v;for(;i<f;i++)fn((v=this[i]),i,this)&&r.push(v);return r});
	fp(fy(A),'indexOf',function(k,i){var f=this.length>>>0;i=i<<0;for(i+=i<0?f:0;i<f;i++)if(this[i]===k)return i;return -1});
	fp(fy(A),'forEach',function(fn,t){var s=O(this),n=s.length,k;for(k=0;k<n;k++)fn.call(t,s[k],k,s);});
	fp(fy(A),'some',function(fn,t){var s=O(this),f=s.length>>>0,k;for(k=0;k<f;k++){if(fn.call(t,s[k],k,s))return !0}return !1});
	fp(fy(A),'find',function(fn,t){var s=O(this),f=s.length>>>0,k,v;for(k=0;k<f;k++){if(fn.call(t,v=s[k],k,s))return v}return void 0});
	fp(fy(F),'bind',function(T){var a=fy(A).slice.call(arguments,1),b=this,fa=function(){},fb=function(){return b.apply(this instanceof fa?this:T,a.concat(fy(A).slice.call(arguments)))};fa.prototype=fy(this);fb.prototype=new fa();return fb});
	fp(fy(E),'preventDefault',function(){this.cancelable&&(this.returnValue=!1)});
	fp(fy(E),'stopPropagation',function(){this.cancelBubble=!0});
	fp(fy(E),'stopImmediatePropagation',function(){this.cancelBubble=this.cancelImmediate=!0});
	fp(T,'origin',function(){return this.protocol+'//'+this.host});
	fp(T,'toString',function(){return this.href});

	if (!fy(E).addEventListener) fl(fy(Window)), fl(fy(E)), fl(fy(HTMLDocument)), fd(fy(Window)), fd(fy(E)), fd(fy(HTMLDocument));

	ff((function(fs){return{previousElementSibling:function(){return fs(this,'previous')},nextElementSibling:function(){return fs(this,'next')}}})(function fs(e,k){while((e=e[k+'Sibling'])&&e.nodeType!=1);return e}),function(k,v){(v in D.documentElement)||fg(fy(T),k,v)});

	!function(g){var fs=function(t){return fy(A).join.call(t,' ')},fi=function(t,s){return(' '+fs(t)+' ').indexOf(' '+s+' ')},fv=function(s){if(!(s=s+'')||/\s/.test(s))throw Error('"'+s+'" is invalid');return s},ft=function(s,f){var t=this;return t.contains(s)?(f===!1&&t.remove(s),!1):(f===!0&&t.add(s),!0)},fe=function(){return fy(A).filter.call(this,function(v,k){return !isNaN(k)})},fc=function(s){return !/\s/.test(s)&&fi(this,s)>=0},fr=function(a,b){var t=this;if(!b)throw TypeError('Not enough arguments');return t.contains(a=fv(a))&&(b=fv(b))&&(t.remove(a),t.add(b),!0)},fh=function(f,s){var t=this;ff(fe.call(t),function(k,v){f.call(s,v,+k,t)})},fk=function(){return O.keys(fe.call(this))},fT=function(e){var t=this;t.value=(e.getAttribute('class')||'').trim();t.length=t.value?fy(A).push.apply(t,t.value.split(/\s+/)):0;t.element=e;fy(fT).toString=function(){return fs(this)};fy(fT)._values=fy(fT)._entries=fe;fy(fT)._keys=fk},_=D.createElementNS('http://www.w3.org/2000/svg','g'),p='classList';fp(W,g,fT);(p in _)||fg(fy(T),p,function(){return new W[g](this)});fp(fy(fT),'add',function(){var t=this,a=arguments,i,s;for(i=0;i<a.length;i++)t.contains(s=fv(a[i]))||(fy(A).push.call(t,s),t.element.setAttribute('class',fs(t)))});fp(fy(fT),'remove',function(){var t=this,a=arguments,i=a.length,s;while(--i>=0)if(t.contains(s=fv(a[i]))){fh.call(t,function(v,k){v===s&&fy(A).splice.call(t,k,1)});t.element.setAttribute('class',fs(t))}});fp(fy(fT),'item',function(i){return this[i]||null});fp(fy(fT),'contains',fc);fp(fy(fT),'replace',fr);fp(fy(fT),'toggle',ft);fp(fy(fT),'forEach',fh);_[p].add('a','b');_[p].contains('b')||(fy(W[g]).contains=fc);_[p].toggle('c',!1)||(fy(W[g]).toggle=ft);_=null}
	('DOMTokenList');
	/* source: mozilla */fp(fy(E),'matches',fy(E).matchesSelector||fv(fy(E),'MatchesSelector')||function(s){var t=this,m=(t.document||t.ownerDocument).querySelectorAll(s);while(--i>=0&&m[i]!==t);return i>-1});
	/* source: github/paulirish/1579671 */fp(W,'requestAnimationFrame',fv(W,'RequestAnimationFrame')||(function(l){return function(fn){var n=+new Date,c=Math.max(0,16-n-l),i=W.setTimeout(function(){fn(n+c)},c);l=n+c;return i}})(0));fp(W,'cancelAnimationFrame',fv(W,'CancelAnimationFrame')||fv(W,'CancelRequestAnimationFrame')||function(i){clearTimeout(i)});
})(window, document, Object, String, Array, Function, Event, Element, Location);

/**
 * An scope that defines {@link APR} and {@link APR.Define}.
 * @param {function} callback Some code.
 */
(function (callback) {

	'use strict';

	/**
	 * Private members.
	 * @namespace APR._
	 * @ignore
	 * @private
	 */
	var _ = /** @lends APR._ */{};
	/**
	 * A set of the most common functions used throughout my web developments.
	 * @namespace APR
	 */
	var APR = {
		/** @readonly */
		'version' : 0.1
	};
	
	/** Some methods */
	Object.assign(APR, /** @lends APR */{
		/**
		 * Checks if an object is a window by checking `window` or some common properties of `window`.
		 * 
		 * @param  {Object}  object Some object.
		 * @return {boolean} true if `object` is `window` or has the common properties, false otherwise.
		 */
		'isWindow' : function (object) {
			return object === window || APR.isKeyValueObject(object) && object.document && object.setInterval;
		},
		/**
		 * An store of private members.
		 * 
		 * @typedef {function} APR~createPrivateKey_privateStore
		 * @param {!Object} key Some object to get/set properties from/to it.
		 */
		
		/**
		 * Implementation of private members in js.
		 *
		 * @see {@link https://github.com/philipwalton/private-parts/blob/master/private-parts.js|source}
		 * @param {function|object} [factory=Object.prototype] A new object with `factory` as it's prototype...
		 * @example
		 *
		 * // Creates an store which extends the public-constructor prototype.
		 * // So you can call the public methods from the private ones.
		 * var _ = createPrivateKey(Object.assign(Object.create(Public.prototype), {
		 *     privateMethod: function () {
		 *         console.log(this); // Shows something like: {public: 'public', privateMethod: function(){}, prototype: Public.prototype, [...]}.
		 *     }
		 * }));
		 *
		 * // Some constructor.
		 * function Public () {
		 *     this.public = 'public';
		 *     // Note that `this` is an object.
		 *     _(this).private = 'private';
		 * }
		 *
		 * console.log(new Public()); // Shows [...] {public: 'public'}
		 * 
		 * @return {APR~createPrivateKey_privateStore} An store of the private values.
		 */
		'createPrivateKey' : function (factory) {
					
			var store = new WeakMap();
			var seen = new WeakMap();

			if (typeof factory !== 'function') {
				factory = Object.create.bind(null, factory || Object.prototype, {});
			}

			return function (key) {

				var value;

				if (!(key instanceof Object)) {
					return;
				}

				if (APR.isWindow(key)) {
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

		},
		/**
		 * Gets DOM Elements by a CSS Selector. Note: CSS3 `selector`s are not supported by ie8.
		 * 
		 * @param  {DOMString} selector A CSS selector.
		 * @param  {Node} [parent=document] The parent node.
		 * @return {Array} 
		 */
		'getElements' : function (selector, parent) {
			return Array.from((parent || document).querySelectorAll(selector));
		},
		/**
		 * Checks if `value` is an object in a "JSON format".
		 * 
		 * @param {*} value Some value.
		 * @example
		 * isKeyValueObject([1, 2]); // false.
		 *
		 * @example
		 * isKeyValueObject({a: 1}); // true.
		 */
		'isKeyValueObject' : function (value) {
			return value && typeof value === 'object' && !Array.isArray(value);
		},
		/**
		 * Checks if `value` looks like `defaultValue`.
		 *
		 * @param {*} value Any value-
		 * @param {*} defaultValue A value with a desired type for `value`.
		 *
		 * @example
		 * defaults([1, 2], {a: 1}); // {a: 1}
		 * 
		 * @example
		 * defaults({}, null); // {}: null is an object.
		 * defaults([], null); // []: null is an object.
		 * defaults(null, {}); // {}: null is not a key-value object.
		 * defaults(null, []); // []: null is not an array.
		 * 
		 * @example
		 * defaults(1, NaN); // 1 (NaN is a Number)
		 *
		 * @returns `value` if it looks like `defaultValue` or `defaultValue` otherwise.
		 */
		'defaults' : function (value, defaultValue) {

			if (Array.isArray(defaultValue)) {
				return Array.isArray(value) ? value : defaultValue;
			}

			if (APR.isKeyValueObject(defaultValue)) {
				return APR.isKeyValueObject(value) ? value : defaultValue;
			}

			return typeof value === typeof defaultValue ? value : defaultValue;

		},
		/**
		 * The values returned by {@link APR~eachElement_fn}.
		 * 
		 * @typedef {Array} APR~eachElement_returnedValues
		 */

	 	/**
	 	 * A function to call in each iteration.
	 	 * 
	 	 * @typedef {function} APR~eachElement_fn
	 	 * @this `thisArg` of {@link APR.eachElement}.
	 	 * @param {*} value The value of the element in the current `index`.
	 	 * @param {number} index The current index.
	 	 * @param {Array} array The array that is being used.
	 	 * @param {APR~eachElement_returnedValues} returnedValues The values returned at the moment.
	 	 * @return {*} A value that you want to add into `returnedValues`.
	 	 */
	 	
		/**
		 * Loops through `arrayLike` and calls `fn` in each iteration.
		 * 
		 * @param  {*} [arrayLike=Array] Something with "length" as a property.
		 * @param  {APR~eachElement_fn} fn Some function.
		 * @param  {*} thisArg The variable to pass as `this` in `fn`.
		 * 
		 * @example
		 *
		 * eachElement({0: 'a', 1: 'b', 2: 'c', length: 3}, function (value, index, array, returnedValues) {
		 * 	   this.log(returnedValues[array.length + index] = returnedValues.length + ':' + '?'); // `this` is `console`.
		 *     return index + ':' + value;
		 * }, console); // ['0:a', '1:b', '2:c', '3:?', '4:?', '5:?']
		 * 
		 * @return {APR~eachElement_returnedValues} The values returned by `fn`.
		 */
		'eachElement' : function (arrayLike, fn, thisArg) {
				
			var array = Array.from(arrayLike);
			var returnedValues = [];
			var i, f;

			for (i = 0, f = array.length; i < f; i++) {
				returnedValues[i] = fn.call(thisArg, array[i], i, array, returnedValues);
			}

			return returnedValues;

		},
		/**
		 * The full parts of an url.
		 * 
		 * @typedef {Object} APR~urlParts
		 * @property {string} protocol A protocol (including ":", like "ftp:") or ":".
		 * @property {string} href An absolute url (like "ftp://username:password@www.example.com:80/a?b=1#c").
		 * @property {string} host The host (like "www.example.com:80") or an empty string.
		 * @property {string} hostname A hostname (like "www.example.com").
		 * @property {string} port The GIVEN port as a number (like "80") or an empty string.
		 * @property {string} pathname A pathname (like "/a").
		 * @property {string} origin The origin (like "ftp://www.example.com").
		 * @property {string} search The query arguments (including "?", like "?b=1") or an empty string.
		 * @property {string} hash The hash (including '#', like "#c") or an empty string.
		 * @property {string} username The given username or an empty string.
		 * @property {string} password The given password or an empty string.
		 */

		/**
		 * Parses `url` without checking if it's a valid url.
		 * 
		 * Note that this function uses `window.location` to make relative urls, so
		 * weird values in there will give weird results.
		 * 
		 * @param {string} [url=window.location.href] A relative, an absolute or a blob url.
		 * 
		 * @example <caption>An absolute url:</caption>
		 * parseUrl(window.location.href);
		 * 
		 * @example <caption>A relative url:</caption>
		 * parseUrl('/?a#c?d'); // "/" is the pathname, "?a" the search and "#c?d" the hash.
		 *
		 * @example <caption>A blob url:</caption>
		 * parseUrl('blob:'); // Same as 'blob:' + `window.location.href`
		 *
		 * @example <caption>Some good-to-know urls:</caption>
		 * parseUrl(); // Same as `window.location`.
		 * parseUrl('a'); // Something that doesn't start with "/", "?", or "#" is evaluated as a host.
		 * parseUrl('a:b'); // "a:b" is a host, since "b" is not a number.
		 * parseUrl('//'); // evals as the current origin.
		 * parseUrl('blob://'); // Same as 'blob:' + `window.location.origin`.
		 * // [...]
		 * 
		 * @return {APR~urlParts} 
		 */
		'parseUrl' : function (url) {
			
			var parts = {}, optionalParts, hrefParts, args, id, uriParts, domainParts, hostParts, userParts, passwordParts;
			var location = Object.assign({}, window.location);
			var blob;

			url = url || location.href;

			if (/^blob\:/i.test(url)) {
				blob = APR.parseUrl(url.replace(/^blob\:/i, ''));
				return Object.assign(blob, {
					'protocol' : 'blob:',
					'href' : 'blob:' + blob.href,
					'host' : '',
					'hostname' : '',
					'port' : '',
					'pathname' : blob.origin + blob.pathname
				});
			}

			if (/^(\:)?\/\//.test(url)) {
				url = (url = url.replace(/^\:/, '')) === '//' ? location.origin : location.protocol + url;
			}
			else if (/^(\?|\#|\/)/.test(url)) {
				url = location.origin + url;
			}
			else if (!/\:\/\//.test(url)) {
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

			if (/@/.test(hostParts[0])) {
				userParts = hostParts[0].split('@');
				passwordParts = userParts[0].split(':');
				parts.username = passwordParts[0] || '';
				parts.password = passwordParts[1] || '';
				hostParts[0] = userParts[1];
			}

			parts.host = hostParts[0] || '';
			parts.pathname = hostParts[1] || '';

			domainParts = parts.host.split(/:[0-9]+/);
			
			parts.hostname = domainParts[0] || '';
			parts.port = typeof domainParts[1] === 'number' ? domainParts[1] : '';

			parts.protocol = uriParts[0] + ':';
			parts.origin = parts.protocol + '//' + parts.host;

			parts.href = (userParts
				? parts.protocol + '//' + parts.username + ':' + parts.password + '@' + parts.host
				: parts.origin
			) + parts.pathname + parts.search + parts.hash;

			return parts;

		},
		/**
		 * Set keys of `object` as if it were an array. (Same as {[variable]: 'value'} in most recent browsers).
		 * 
		 * @param {*} [object=Object] The base object.
		 * @param {Array} properties A pair of values: 2n being the key, 2n + 1 being the value.
		 * @example
		 *
		 * var obj = {};
		 *
		 * eachElement(['a', 'b', 'c'], function (key, index, array) {
		 *     
		 *     return setDynamicKeys(this, [
		 *         key, index
		 *     ]);
		 *     
		 * }, obj); // returns [{a: 0}, {a: 0, b: 1}, {a: 0, b: 1, c: 2}]
		 * // now, `obj` is {a: 0, b: 1, c: 2}.
		 * 
		 * @return {!Object} `object` with the given `properties` added.
		 */
		'setDynamicKeys' : function (object, properties) {

			var i, f, key, value;

			if (!APR.isKeyValueObject(object)) {
				object = {};
			}

			for (i = 0, f = properties.length - 1; i < f; i += 2) {
				key = properties[i];
				value = properties[i + 1];
				object[key] = value;
			}

			return object;

		},
		/**
		 * Parses a JSON string into a JSON-like.
		 * 
		 * @param  {string} string Some string to parse.
		 * 
		 * @example
		 * stringToJSON('{"a": 1}'); // returns {a: 1}.
		 *
		 * @example
		 * stringToJSON(1); // returns {}.
		 * 
		 * @return {!Object} A JSON-like object.
		 */
		'stringToJSON' : function (string) {
			
			var json;

			if (typeof string !== 'string') {
				return {};
			}

			try {
				json = JSON.parse(string) || {};
			}
			catch (exception) {
				return {}
			}

			return json;

		},
		/**
		 * Search any `value` (including NaN) in `array`.
		 * 
		 * @param  {Array} array Some array.
		 * @param  {*} value Any value to find in `array`.
		 * @return {boolean}
		 */
		'inArray' : function (array, value) {
			return array.some(function (v) {
				return value === v || (Number.isNaN(value) && Number.isNaN(v));
			});
		},
		/**
		 * A function that will be called in each iteration.
		 * 
		 * @typedef {function} APR~eachProperty_fn
		 * @this {*} `thisArg` of {@link APR.eachProperty}.
		 * @param {*} value The value of the current `key` in `object`.
		 * @param {string} key The current key of `object`.
		 * @param {!Object} object The object that is being iterated.
		 */
		
		/**
		 * Iterates the properties of a JSON-like object.
		 * 
		 * @param  {!Object}  properties A JSON-like object to iterate.
		 * @param  {APR~eachProperty_fn} fn The function that will be called in each iteration.
		 * @param  {*} thisArg `this` for `fn`.
		 * @param  {boolean} [strict=false] false: iterate only the owned properties.
		 *                                  true: iterate the prototype chain too.
		 */
		'eachProperty' : function (properties, fn, thisArg, strict) {

			var k;

			for (k in properties) {
				
				if (Object.prototype.hasOwnProperty.call(properties, k) || strict) {
					fn.call(thisArg, properties[k], k, properties);
				}

			}

		},
		/**
		 * A function to call when it reaches the deep property of an object.
		 * 
		 * @typedef {function} APR~access_handler
		 * @this  {Object} A new object with the properties of the base object.
		 * @param {!Object} currentObject The object containing the `currentKey`.
		 * @param {*} currentKey The last value given in `path`.
		 * @param {boolean} propertyExists false if some key of `path` was created, true otherwise.
		 * @param {Array} path The given keys.
		 */

		/**
		 * Accesses to a deep property in a new `object` (or `object` if `mutate` evals to true).
		 * 
		 * @param  {!Object} object The base object.
		 * @param  {Array} [path=[path]] The ordered keys.
		 * @param  {APR~access_handler} [handler] A custom function.
		 * @param  {boolean} mutate If it evals to true, it will use `object` as the base object,
		 *                          otherwise it will create a new `object` without the prototype chain.
		 * @throws {TypeError} If some property causes access problems.
		 * @example <caption>Accessing to some existent property</caption>
		 *
		 * access({a: {b: {c: {d: 4}}}}, ['a', 'b', 'c', 'd'], function (currentObject, currentKey, propertyExists, path) {
		 *     return propertyExists ? currentObject[currentKey] : null;
		 * }); // returns 4.
		 *
		 * @example <caption>Accessing to some existent property with a non-JSON-like-object as a value</caption>
		 *
		 * access({a: 1}, ['a', 'b', 'c']); // throws TypeError.
		 *
		 * @example <caption>Accessing to some non-existent property</caption>
		 *
		 * var obj = {z: 1, prototype: [...]};
		 * var newObj = access(obj, 'a.b.c'.split('.'), function (currentObject, currentKey, propertyExists, clonedObject, path) {
		 *     
		 *     if (!propertyExists) {
		 *         clonedObject[currentKey] = path.length;
		 *     }
		 *     
		 *     // At this point:
		 *     //     `obj` is {z: 1},
		 *     //     `clonedObject` has a value in `currentKey`,
		 *     //     and `this` has all the added keys (even the ones modified in `clonedObject`).
		 *     return this;
		 * 
		 * }); // returns {z: 1, a: {b: {c: 3}}}
		 *
		 * // if you want the prototype chain of obj, just copy it.
		 * Object.assign(newObj.prototype, obj.prototype);
		 *
		 * @example <caption>Modifying the base object</caption>
		 * 
		 * var obj = {a: {b: 1}, b: {b: 2}, prototype: [...]};
		 * 
		 * access(obj, 'a.b', function (currentObject, currentKey, propertyExists, clonedObject, path) {
		 *     currentObject[currentKey] = 2;
		 * }, true);
		 *
		 * // now `obj` is {a: {b: 2}, b: {b: 2}, prototype: [...]}.
		 * 
		 * @return If `handler` is given: the returned value of that function,
		 *         otherwise: the last value of `path` in the cloned object.
		 */
		'access' : function (object, path, handler, mutate) {

			var propertyExists = true;
			var baseObject = mutate ? object : Object.assign({}, object);
			var currentObject = baseObject;
			var lastKey;

			path = APR.defaults(path, [path]);
			lastKey = path[path.length - 1];

			APR.eachElement(path.slice(0, -1), function (key, i) {

				currentObject = typeof currentObject[key] !== 'undefined' ? currentObject[key] : ((propertyExists = false), {});

				if (currentObject !== null && !APR.isKeyValueObject(currentObject)) {
					throw new TypeError('The value of "' + key + '" is not a "key-value" object.');
				}

			});

			return handler ? handler.call(baseObject, currentObject, lastKey, propertyExists, path) : currentObject[lastKey];

		},
		/**
		 * Checks if the screen is touch.
		 * 
		 * @return {boolean}
		 */
		'isTouchDevice' : function () {

			var isTouch = 'ontouchstart' in body
				|| navigator.maxTouchPoints > 0
				|| navigator.msMaxTouchPoints > 0;

			return isTouch;

		},
		/**
		 * Returns the first value if there's only one.
		 
		 * @param  {*} [value=[value]] Some value with a `length` property.
		 * @return {*}
		 */
		'getFirstOrMultiple' : function (value) {
			return value.length === 1 ? value[0] : value;
		},
		/**
		 * A function that checks if `this` is the Node that you're looking for.
		 * 
		 * @typedef {function} APR~getRemoteParent_fn
		 * @this {Node}
		 * @return {boolean}
		 */
		/**
		 * Goes up through the `element` parent's, until `fn` returns true
		 * or a non-Node is found.
		 * 
		 * @param  {Node} element Some child.
		 * @param  {APR~getRemoteParent_fn} fn Some custom handler.
		 * @param  {Node} [container=html] The farthest parent.  
		 * @param  {boolean} [includeElement=false] If true, it calls `fn` with `element` too.
		 * @return {?Node} The current Node when `fn` returns true.
		 * @example
		 * APR.getRemoteParent(APR.body, function () {
		 *     return this.tagName === 'HTML';
		 * }); // returns the html Element.
		 */
		'getRemoteParent' : function (element, fn, container, includeElement) {

			var parentNode = null;

			if (!(container instanceof Node)) {
				container = APR.html;
			}

			if (!element) {
				return null;
			}

			if (includeElement && fn.call(element)) {
				return element;
			}

			while (
				(parentNode = (parentNode || element).parentNode) &&
				(parentNode !== container || (parentNode = null)) &&
				!fn.call(parentNode)
			);
			
			return parentNode;
		
		},
		/**
		 * A cross-browser solution to get the pressed key on a keyboard
		 * event.
		 * 
		 * @param Event e Some event.
		 * @return {number|string} Any of e.key, e.code, e.which or w.keyCode
		 *
		 * @example
		 * document.addEventListener('keypress', function (e) {
		 *     if (/(Enter|13)/.test(getPressedKey(e))) {
		 *         console.log('Enter');
		 *     }
		 * });
		 */
		'getPressedKey' : function (e) {
			return e.key || e.code || e.which || e.keyCode;
		},
		/**
		 * A custom function to append the created element.
		 * 
		 * @typedef {function} APR~load_handler
		 * @this {!Element} The element that loads the url.
		 * @param {?Element} loadedElement An identical element that has been loaded previously.
		 */
		
		/**
		 * A tagName of an Element (such as "link").
		 * @typedef {string} APR~element_tag
		 */
		
		/**
		 * A synonym for a {@link APR~element_tag|tag}.
		 * @typedef {string} APR~load_synonym
		 */
		
		/**
		 * An src-like attribute for an Element.
		 * @typedef {string} APR~load_srcLikeAttribute
		 */
		
		/**
		 * Loads an external file.
		 *
		 * @function
		 * @param  {APR~element_tag} tag A tag name or {@link APR.load.SYNOMYMS_FOR_TAGS|a known type}.
		 * @param  {string} url The url of the file.
		 * @param  {APR~load_handler} [handler] If it's a function: it will be triggered (without appending the element),
		 *                                  otherwise: the element will be appended to {@link APR.head|head}.
		 * @property {Object.<APR~load_synonym, APR~element_tag>} SYNOMYMS_FOR_TAGS Defines synonyms for {@link APR~element_tag|element-tags}.
		 * @property {Object.<APR~element_tag, APR~load_srcLikeAttribute>} NON_SRC_ATTRIBUTES {@link APR~element_tag|Element-tags} that are known for not using 'src' to fetch an url.
		 * @example
		 * 
		 * load('link', '/css/index.css', function (loadedFile) {
		 *
		 *     if (loadedFile) {
		 *         return;
		 *     }
		 *     
		 *     this.onload = function () {};
		 *     this.onerror = function () {};
		 *     
		 *     APR.head.appendChild(this);
		 *
		 * });
		 *
		 * @example <caption>Modifying "constants".</caption>
		 *
		 * load.SYNONYMS_FOR_TAGS['font'] = 'link';
		 * load('font', '/myFont.css', function () { [...] }); // loads <link href='/myFont.css'/>.
		 * 
		 */
		'load' : (function () {

			return Object.assign(function (tag, url, handler) {

				var element, loadedFile, attribute;

				tag = APR.load.SYNOMYMS_FOR_TAGS[tag] || tag;
				attribute = APR.load.NON_SRC_ATTRIBUTES[tag] || 'src';

				loadedFile = APR.getElements(tag +'[' + attribute + '="' + url + '"], ' + tag + '[' + attribute + '="' + APR.parseUrl(url).href + '"]')[0];
				
				APR.defaults(handler, function (loadedFile) {
					
					if (!loadedFile) {
						APR.head.appendChild(this);
					}

				});

				if (loadedFile) {
					return handler.call(element, loadedFile), void 0;
				}

				element = document.createElement(tag);
				element[attribute] = url;

				if (tag === 'link') {
					element.rel = 'stylesheet';
				}
			
				if (APR.parseUrl(url).origin !== window.location.origin && APR.inArray(['video', 'img', 'script'], tag)) {
					element.setAttribute('crossorigin', 'anonymous');
				}

				handler.call(element, loadedFile);

			}, {
				'SYNOMYMS_FOR_TAGS' : {
					'style' : 'link',
					'image' : 'img',
					'worker' : 'script',
					'document' : 'iframe',
					'object' : 'embed',
					'js' : 'script',
					'css' : 'style'
				},
				'NON_SRC_ATTRIBUTES' : {
					'link' : 'href'
				}
			});

		})(),
		/**
		 * Gets the name of `fn` using fn.name (if supported) or a regexp.
		 * 
		 * @param  {function} fn Any function.
		 * @return {string} The function name or an empty string if something fails.
		 */
		'getFunctionName' : function (fn) {

			var matches;

			if (typeof fn !== 'function') {
				return '';
			}

			if (fn.name) {
				return fn.name;
			}

			matches = fn.toString().match(/function([^\(]+)\(+/i);

			return matches ? matches[1].trim() : '';

		},
		/**
		 * Checks if an object has no direct keys.
		 * 
		 * @param  {Object}  object Some object.
		 * @return {boolean} true if it's null or not an object.
		 */
		'isEmptyObject' : function (object) {
			
			var k;
			
			for (k in object) {
				if (Object.prototype.hasOwnProperty.call(object, k)) {
					return false;
				}
			}

			return true;
		}
	});

	/** Some vars */
	Object.assign(APR, /** @lends APR */{
		/**
		 * Returns a ready-to-load URL for an APR file.
		 * 
		 * @typedef {function} APR~self_setFileUrl
		 * @param {string} name The name of the file.
		 * @param {string} ext The file extension.
		 * @param {(string|number)} [version=""] The version of the file.
		 * @return {string}
		 */
		
		/**
		 * Useful values related with the script itself.
		 *  
	 	 * @property {string} originUrl The origin of the URL that contains other than static content.
	 	 * @property {string} staticOriginUrl The origin of the URL that serves APR's files.
		 * @property {APR~self_setFileUrl} setFileUrl Sets the url of APR's files.
		 */
		'self' : Object.create({
			'originUrl' : 'https://www.aprservices.com',
			'staticOriginUrl' : 'https://www.code.aprservices.com',
			'setFileUrl' : function (name, ext, version) {
				return this.staticOriginUrl + '/' + ext + '/' + name + '/dev/' + version + '.' + ext + '?nocache=true'
			}
		}),
		/**
		 * The first body element of the current document.
		 * @type {Element}
		 * @readOnly
		 */
		'body' : APR.getElements('body')[0],
		/**
		 * The first head element of the current document.
		 * @type {Element}
		 * @readOnly
		 */
		'head' : APR.getElements('head')[0],
		/**
		 * The html element of the current document.
		 * @type {Element}
		 * @readOnly
		 */
		'html' : document.documentElement || APR.body.parentNode,
		/**
		 * The DoNotTrack header formatted as 0, 1 or undefined (for "unspecified").
		 * @type {(number|undefined)}
		 * @readOnly
		 */
		'DNT' : (function () {

			var dnt = [navigator.doNotTrack, navigator.msDoNotTrack, window.doNotTrack];
			var consent = ',' + dnt + ',';

			return /,(yes|1),/i.test(consent) ? 1 : /,(no|0),/i.test(consent) ? 0 : void 0;

		})(),
		/**
		 * Namespace uris for known tags.
		 * @type {Object.<APR~element_tag, string>} A tag with a namespace URI.
		 */
		'ELEMENT_NAMESPACES' : {
			'html' : 'http://www.w3.org/1999/xhtml',
			'mathml' : 'http://www.w3.org/1998/Math/MathML',
			'svg' : 'http://www.w3.org/2000/svg',
			'xlink' : 'http://www.w3.org/1999/xlink',
			'xml' : 'http://www.w3.org/XML/1998/namespace',
			'xmlns' : 'http://www.w3.org/2000/xmlns/',
			'xbl' : 'http://www.mozilla.org/xbl',
			'xul' : 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'
		}
	});

	APR.Define = (function () {
		/**
		 * An asynchronous module loader.
		 * @namespace APR.Define
		 */
		
		/**
		 * @namespace APR.Define._
		 * @private
		 * @ignore
		 */
		var _ = Object.assign(APR.createPrivateKey(), /** @lends APR.Define._ */{

			/** An state meaning that is loaded, but not called. */
			'STATE_LOADED' : 'loaded',
			/** An state meaning that all the dependencies were defined. */
			'STATE_CALLED' : 'called',
			/**
			 * @namespace APR.Define._.modules
			 * @private
			 * @ignore
			 * 
			 * @property {Object.<APR.Define~namespaceID, {
			 *     state: string,
			 *     details: Object
			 * }>} defined A list of namespace ids that were defined by {@link APR.Define}.
			 * 
			 * @property {Object.<APR.Define~namespaceID, {
			 *     handler: function,
			 *     dependencies: APR.Define~namespaceID[]
			 * }>} deferred Useful data for modules that need to be loaded later.
			 * 
			 * @property {APR.Define~namespaceID[]} currentlyLoading A useful variable to
			 *           check if everything got loaded by {@link APR.Define.load}.
			 */
			'modules' : {
				'defined' : {},
				'deferred' : {},
				'currentlyLoading' : []
			},
			/** Gets triggered when everything gets called. */
			'onFinish' : function () {
				_.modules.defined = {};
			},
			/** Updates the modules that got loaded. */
			'callDeferredModules' : function () {

				var definedModules = _.modules.defined;

				APR.eachProperty(_.modules.deferred, function (details, namespaceID) {

					var isKnownModule = definedModules[namespaceID];

					if (!_.getModule(namespaceID) && !isKnownModule) {
						throw new Error(namespaceID + ' is not defined.');
					}

					_.modules.defined[namespaceID].state = isKnownModule ? _.STATE_LOADED : _.STATE_CALLED;
					_.updateModules(namespaceID);

				});

			},
			/**
			 * Splits a namespace and {@link APR.access|accesses} to each value starting with {@link APR.Define._.getRootElement|a global element}.
			 *
			 * @param  {APR.Define~namespaceID} namespaceID A given namespace id.
			 * @return {(Object|undefined)}
			 */
			'getModule' : function (namespaceID) {
				var namespace = _.modules.defined[namespaceID].details.namespace;

				return APR.access(APRDefine.getRootElement(), namespace.split(APRDefine.SPLIT_NAMESPACE_USING), function (v, k, isDefined) {
					return isDefined ? v[k] : void 0;
				});
			},
			/**
			 * Calls a module with the dependencies as his parameters.
			 * Then, if everything is defined, {@link APR.Define._.updateModules|updates all the modules}.
			 * 
			 * @param  {APR.Define~namespaceID} namespaceID Some namespaceID.
			 * @param  {APR.Define~using_handler} handler Some handler.
			 * @return {boolean} true if it succeed, false otherwise.
			 */
			'callModule' : function (namespaceID, handler) {

				var deferredModule = _.modules.deferred[namespaceID];
				var params = deferredModule ? APR.eachElement(deferredModule.dependencies, function (dependencyNS) {
					return _.getModule(dependencyNS);
				}) : [];
				var thisArg = Object.assign({}, _.modules.defined[namespaceID].details);

				if (params.some(function (isDefined) { return !isDefined; })) {
					return false;
				}

				handler.apply(thisArg, params);

				delete _.modules.deferred[namespaceID];
				_.modules.defined[namespaceID].state = _.STATE_CALLED;
				_.updateModules(namespaceID);

				return true; 

			},
			/**
			 * If there are dependencies, it checks if the ones defined by `definedNamespace` got loaded or called.
			 * If there aren't, {@link APR.Define._.onFinish|it finishes}.
			 *
			 * @param  {APR.Define~namespaceID} definedNamespace Some namespaceID that was defined by {@link APR.Define}.
			 */
			'updateModules' : (function () {

				/**
				 * Checks if all the namespaces in the dependencies of `deferredModule` have
				 * the given `state`.
				 * 
				 * @param  {string} state Some known state.
				 * @param  {Object} deferredModule A module.
				 * @return {boolean}
				 */
				function areDependencies (state, deferredModule) {

					var definedModules = _.modules.defined;

					return !deferredModule.dependencies.some(function (dependencyNS) {
						return APR.defaults(definedModules[dependencyNS], {}).state !== state;
					});

				}

				/** @borrows APR.Define._.updateModules */
				return function (definedNamespace) {

					var definedModules = _.modules.defined;
					var deferredModules = _.modules.deferred;
					var definedModule = definedModules[definedNamespace];
					var deferredModule = deferredModules[definedNamespace];

					if (APR.isEmptyObject(deferredModules) && !_.modules.currentlyLoading.length) {
						return _.onFinish(), void 0;
					}

					if (definedModule.state === _.STATE_CALLED) {

						return APR.eachProperty(deferredModules, function (currentModule, namespaceID) {

							if (areDependencies(_.STATE_CALLED, currentModule)) {
								_.callModule(namespaceID, currentModule.handler);
							}

						}), void 0;

					}

					if (areDependencies(_.STATE_CALLED, deferredModule)) {
						_.callModule(definedNamespace, deferredModule.handler);
					}

				};

			})()

		});
		
		/**
		 * A unique module name splited by {@link APR.Define.SPLIT_NAMESPACE_USING|a separator}
		 * to define the scope in which the module will be defined.
		 * 
		 * @typedef {string} APR.Define~namespace
		 * @example
		 * 'APR/Define'; // represents window.APR.Define;
		 */
		
		/**
		 * Defines a namespace. 
		 * @constructor
		 * @param {APR.Define~namespace} namespace Some namespace.
		 * @param {*} [version] The version of the module.
		 * @param {string} [namespaceID="namespace-version"] An id for the namespace.
		 */
		function APRDefine (namespace, version, namespaceID) {

			if (!(this instanceof APRDefine)) {
				return new APRDefine(namespace, version, namespaceID);
			}

			if (typeof namespace !== 'string') {
				throw new TypeError(namespace + ' must be an string.');
			}

			if (typeof namespaceID !== 'string') {
				namespaceID = '';
				namespaceID = Array.prototype.filter.call(arguments, function (hasValue) {
					return hasValue;
				}).join('-');
			}

			_(this).namespaceID = namespaceID;

			_.modules.defined[namespaceID] = {
				'state' : _.STATE_LOADED,
				'details' : {
					'namespace' : namespace,
					'version' : version,
					'id' : namespaceID
				}
			};

		}

		Object.assign(APRDefine, /** @lends APR.Define */{
			/**
			 * The default separator for each property of a {@link APR.Define~namespace|namespace}.
			 * @default /
			 */
			'SPLIT_NAMESPACE_USING' : '/',
			/**
			 * @return {Object} A global element, where everything gets defined.
			 * @default  window
			 */
			'getRootElement' : function () {
				return window;
			},
			/**
			 * Loads files and waits until everything (in these files) gets added.
			 * Then, magic happens.
			 * 
			 * @param  {Object.<APR.Define~namespaceID, string>} urls A namespace id with a url as a value.
			 */
			'load' : (function () {

				var prepareHandler = function (namespaceID) {

					var onLoad = function () {

						var modulesLoading = _.modules.currentlyLoading;

						modulesLoading.splice(modulesLoading.indexOf(namespaceID), 1);

						if (!modulesLoading.length) {
							_.callDeferredModules();
						}

					};

					_.modules.currentlyLoading.push(namespaceID);

					return function (loadedScript) {

						if (loadedScript) {
							onLoad();
							return;
						}

						this.onload = function () {
							this.onload = null;
							this.onerror = null;
							onLoad();
						};

						this.onerror = function () {
							throw new Error('There was an error trying to load a script with the next url: ' + this.src);
						};

						APR.head.appendChild(this);

					};

				};

				return function (urls) {

					if (!APR.isKeyValueObject(urls)) {
						throw new TypeError(urls + ' must be a key-value object.');
					}

					APR.eachProperty(urls, function (url, namespaceID) {
						APR.load('script', url, prepareHandler(namespaceID));
					});

				};

			})()
		});

		Object.assign(APRDefine.prototype, /** @lends APR.Define.prototype */{

			/**
			 * A function that will be called when all the dependencies get defined.
			 * @typedef {function} APR.Define~using_handler
			 */
			
			/**
			 * An object that is intented to {@link APR.Define.load|load} the given urls
			 * and meet the following requirements:
			 * 
			 * As a key:
			 *     A numeric index (to indicate the order of the parameters in {@link APR.Define~using_handler})
			 *     and a {@link APR.Define~namespaceID|namespaceID}, splited by ":".
			 * As a value:
			 *     An url.
			 *     
			 * @typedef {Object} APR.Define~using_modulesAsObject
			 * @example
			 * [...]using({
			 *     "1:index": "index.js",
			 *     "0:APR/Define-1.9": "/APRDefine.js"
			 * }, function (APRDefine, index) {});
			 */

			/** 
			 * Adds dependencies and a handler to the module.
			 *
			 * @instance
			 * @param  {(APR.Define~namespaceID[]|APR.Define~using_modulesAsObject)} [modules=APR.Define~using_handler] The dependencies for the module or `handler`.
			 * @param  {APR.Define~using_handler} handler Some handler.
			 */
			'using' : function (modules, handler) {

				var args = arguments;
				var namespaceID = _(this).namespaceID;
				var deferredModule;

				if (typeof args[0] === 'function' || !args[0]) {
					Array.prototype.unshift.call(args, []);
					_.callModule(namespaceID, handler = args[1]);
					return;
				}

				deferredModule = _.modules.deferred[namespaceID] = {
					'handler' : handler,
					'dependencies' : []
				};

				if (Array.isArray(modules)) {
					deferredModule.dependencies = modules;
				}
				else if (APR.isKeyValueObject(modules)) {

					APR.eachProperty(modules, function (url, key) {
						
						var splitIndex = key.indexOf(':');
						var currentNS = key.slice(splitIndex + 1);
						var i = +key.slice(0, splitIndex);
						
						if (Number.isNaN(i)) {
							throw new TypeError(key + ' must contain a numeric index an a namespace-id splited by ":", e.g.: "0:namespaceID"');
						}

						deferredModule.dependencies[i] = currentNS;
						APRDefine.load(APR.setDynamicKeys({}, [currentNS, url]))

					}, this);

				}
				else {
					throw new TypeError(modules + ' is neither a "key-value" object, a function, nor an Array.');
				}

				if (!deferredModule.dependencies.length) {
					_.callModule(namespaceID, handler);
				}
				else {
					_.updateModules(namespaceID);
				}

			}

		});

		return APRDefine;

	})();

	APR.LocalStorage = (function () {

		var _ = APR.createPrivateKey();

		function APRLocalStorage (consent) {
			
			if (!(this instanceof APRLocalStorage)) {
				return new APRLocalStorage(consent);
			}

			_(this).consent = !!consent;

		}

		Object.assign(APRLocalStorage, {
			'cookieExists' : function (cookie) {
				return new RegExp('; ' + cookie + '(=|;)').test('; ' + document.cookie + ';');
			},
			'getCookie' : function (name) {
				return ('; ' + document.cookie).split('; ' + name + '=').pop().split('; ').shift().split(/^=/).pop();
			}
		});

		Object.assign(APRLocalStorage.prototype, {
			'setCookie' : function (name, value, options, insecure) {
			
				var cookie = '', set = function (k, v) {
					cookie += k + (typeof v !== 'undefined' ? '=' + v : '') + '; ';
				};

				if (!_(this).consent) {
					return false;
				}

				options = APR.defaults(options, {});

				set(name, value);

				if (!insecure) {
					set('secure');
				}

				if (options['max-age']) {
					options.expires = +new Date() + options['max-age'] * 1e3;
				}

				if (options.expires) {
					options.expires = new Date(options.expires).toGMTString();
				}

				APR.eachProperty(options, function (v, k) {
					set(k, v);
				});

				document.cookie = cookie;

				return true;

			},
			'removeCookie' : function (name, options) {
				
				if (!APRLocalStorage.cookieExists(name)) {
					return true;
				}

				return this.setCookie(name, '', Object.assign(APR.defaults(options, {}), {
					'max-age' : 0
				}));

			},
			'isStorageAvailable' : function (type) {
		
				var _ = 'x';
				var storage;

				if (!_(this).consent) {
					return false;
				}

				try {
					storage = window[type];
					storage.setItem(_, _);
					storage.removeItem(_);
				}
				catch (exception) {
					return false;
				}
				
				return true;

			}
		});

		return APRLocalStorage;

	})();
	
	window.APR = APR;

	callback();

})(
/**
 * Loads defined scripts within attributes in the current document with {@link APR.Define}.
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
 * @example <caption>Adding multiple links to the script tag which loads "APR.js".</caption>
 *
 * <script src='APR.js' data-APR-define='{"index" : "/js/index.js", "module" : "/js/module.js"}'></script>
 * @callback onDocumentReady_findScriptsToDefine
 */
function findScriptsToDefine () {

	var ATTRIBUTE_NAME = 'data-APR-define';
	
	APR.getElements('*[' + ATTRIBUTE_NAME + ']').forEach(function (element) {

		var url = APR.stringToJSON((element.getAttribute(ATTRIBUTE_NAME) || '').replace(/\[([^\]]+)\]/ig, function (_, attributeName) {
			return element.getAttribute(attributeName);
		}));

		APR.Define.load(url);

	});

});