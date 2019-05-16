;(function() {
var APR, src_serverjs, src_lib_isKeyValueObject, src_lib_hasOwn, src_lib_eachProperty, src_lib_defaults, src_lib_access, src_lib_isWindow, src_lib_createPrivateKey, src_lib_isEmptyObject, src_lib_isJSONLikeObject, src_lib_parseUrl, src_lib_stringToJSON;
APR = { 'version': '0.2.0' };
src_serverjs = undefined;
APR['isKeyValueObject'] = src_lib_isKeyValueObject = function isKeyValueObject(value) {
  return /(^\{|\}$)/.test(JSON.stringify(value));
};
APR['hasOwn'] = src_lib_hasOwn = function hasOwn(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
};
APR['eachProperty'] = src_lib_eachProperty = function (hasOwn) {
  /**
  * A function that will be called in each iteration.
  * 
  * @typedef {function} APR~eachProperty_fn
  * @this {*} `thisArg` of {@link APR.eachProperty}.
  * @param {*} value The value of the current `key` in `object`.
  * @param {string} key The current key of `object`.
  * @param {!Object} object The object that is being iterated.
  * @return {*} Some value.
  */
  /**
  * Iterates the properties of a JSON-like object.
  * 
  * @param  {!Object}  properties A JSON-like object to iterate.
  * @param  {APR~eachProperty_fn} fn The function that will be called in each iteration.
  * @param  {*} thisArg `this` for `fn`.
  * @param  {boolean} [strict=false] false: iterate only the owned properties.
  *                                  true: iterate the prototype chain too.
  * @return {!Object} The returned values.
  */
  return function eachProperty(properties, fn, thisArg, strict) {
    var returnedValues = {};
    var k;
    for (k in properties) {
      if (strict || hasOwn(properties, k)) {
        returnedValues[k] = fn.call(thisArg, properties[k], k, properties);
      }
    }
    return returnedValues;
  };
}(src_lib_hasOwn);
APR['defaults'] = src_lib_defaults = function (isKeyValueObject, eachProperty) {
  /**
  * Checks if `value` looks like `defaultValue`.
  *
  * @param {*} value Any value-
  * @param {*} defaultValue A value with a desired type for `value`.
  * 						   If a key-value object is given, all the keys of `value` will `default`
  * 						   to his corresponding key in this object.
  * @param {boolean} ignoreDefaultKeys If evaluates to `false` and `defaultValue` is an json-like object,
  * 									  the default keys will be added to `value` or checked against this
  * 									  function for each repeated key.
  *
  * @example
  * defaults([1, 2], {a: 1}); // {a: 1}
  * 
  * @example
  * defaults({}, null); // {}: null is an object.
  * defaults([], null); // []: null is an object.
  * defaults(null, {}); // {}: null is not a key-value object.
  * defaults(null, []); // []: null is not an Array.
  * 
  * @example
  * defaults(1, NaN); // 1 (NaN is an instance of a Number)
  *
  * @example
  * defaults({'a': 1, 'b': 2}, {'a': 'some string'}, false); // {'a': 'some string', 'b': 2}
  *
  * @example
  * defaults({'a': 1}, {'b': 2}, false); // {'a': 1, 'b': 2}
  * defaults({'a': 1}, {'b': 2}, true); // {'a': 1}
  *
  * @returns `value` if it looks like `defaultValue` or `defaultValue` otherwise.
  */
  return function defaults(value, defaultValue, ignoreDefaultKeys) {
    if (Array.isArray(defaultValue)) {
      return Array.isArray(value) ? value : defaultValue;
    }
    if (isKeyValueObject(defaultValue)) {
      if (!isKeyValueObject(value)) {
        return defaultValue;
      }
      eachProperty(defaultValue, function (v, k) {
        if (typeof value[k] !== 'undefined') {
          value[k] = defaults(value[k], v);
        } else if (!ignoreDefaultKeys) {
          value[k] = v;
        }
      });
      return value;
    }
    return typeof value === typeof defaultValue ? value : defaultValue;
  };
}(src_lib_isKeyValueObject, src_lib_eachProperty);
APR['access'] = src_lib_access = function (defaults, isKeyValueObject) {
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
  * var newObj = access(obj, 'a.b.c'.split('.'), function (currentObject, currentKey, propertyExists, path) {
  *     
  *     if (!propertyExists) {
  *         currentObject[currentKey] = path.length;
  *     }
  *     
  *     // At this point:
  *     //     `obj` is {z: 1},
  *     //     `currentObject` has a value in `currentKey`,
  *     //     and `this` has all the added keys (even the ones modified in `currentObject`).
  *     return this;
  * 
  * }); // returns {z: 1, a: {b: {c: 3}}}
  *
  * // if you want the prototype chain of obj, just copy it.
  * Object.assign(newObj.prototype, obj.prototype);
  *
  * @example <caption>Modifying the base object</caption>
  * 
  * var obj = {a: {b: false}, b: {b: false}, prototype: [...]};
  * 
  * access(obj, 'a.b'.split('.'), function (currentObject, currentKey, propertyExists, path) {
  *     currentObject[currentKey] = 2;
  * }, true);
  *
  * // now `obj` is {a: {a: true}, b: {b: true}, prototype: [...]}.
  * 
  * @return If `handler` is given: the returned value of that function,
  *         otherwise: the last value of `path` in the cloned object.
  */
  return function access(object, path, handler, mutate) {
    var propertyExists = true;
    var baseObject = mutate ? object : Object.assign({}, object);
    var currentObject = baseObject;
    var lastKey;
    path = defaults(path, [path]);
    lastKey = path[path.length - 1];
    path.slice(0, -1).map(function (key, i) {
      currentObject = typeof currentObject[key] !== 'undefined' ? currentObject[key] : (propertyExists = false, {});
      if (currentObject !== null && !isKeyValueObject(currentObject)) {
        throw new TypeError('The value of "' + key + '" is not a "key-value" object.');
      }
    });
    return handler ? handler.call(baseObject, currentObject, lastKey, propertyExists, path) : currentObject[lastKey];
  };
}(src_lib_defaults, src_lib_isKeyValueObject);
APR['isWindow'] = src_lib_isWindow = function (isKeyValueObject) {
  /**
  * Checks if an object is a window by checking `window` or some common properties of `window`.
  * 
  * @param  {Object}  object Some object.
  * @return {boolean} true if `object` is `window` or has the common properties, false otherwise.
  */
  return function isWindow(object) {
    return object === window || isKeyValueObject(object) && object.document && object.setInterval;
  };
}(src_lib_isKeyValueObject);
APR['createPrivateKey'] = src_lib_createPrivateKey = function (isKeyValueObject, isWindow) {
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
  * @param {object} parent The object to extend from.
  * @throws {TypeError} If the key given {@link APR~createPrivateKey_privateStore|in the private store} is not an object.
  * @example
  *
  * // Creates an store which extends the public-constructor prototype.
  * // So you can call the public methods from the private ones.
  * var _ = createPrivateKey({
  *     privateMethod: function () {
  *         console.log(this); // Shows something like: {public: 'public', privateMethod: function(){}, prototype: Public.prototype, [...]}.
  *     }
  * }, Public);
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
  return function createPrivateKey(factory, parent) {
    var store = new WeakMap();
    var seen = new WeakMap();
    if (typeof factory !== 'function') {
      if (isKeyValueObject(parent) && parent.prototype) {
        factory = Object.assign(Object.create(parent.prototype), factory);
      }
      factory = Object.create.bind(null, factory || Object.prototype, {});
    }
    return function (key) {
      var value;
      if (!(key instanceof Object)) {
        throw new TypeError(key + ' must be an object.');
      }
      if (isWindow(key)) {
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
  };
}(src_lib_isKeyValueObject, src_lib_isWindow);
APR['isEmptyObject'] = src_lib_isEmptyObject = function (hasOwn) {
  /**
  * Checks if an object has no direct keys.
  * 
  * @param  {Object} object Some object.
  * @return {boolean} true if it's null or not an object.
  */
  return function isEmptyObject(object) {
    var obj = Object(object);
    var k;
    for (k in obj) {
      if (hasOwn(obj, k)) {
        return false;
      }
    }
    return true;
  };
}(src_lib_hasOwn);
APR['isJSONLikeObject'] = src_lib_isJSONLikeObject = function (isKeyValueObject) {
  return isKeyValueObject;
}(src_lib_isKeyValueObject);
APR['parseUrl'] = src_lib_parseUrl = function parseUrl(url) {
  var parts = {}, optionalParts, hrefParts, args, id, uriParts, domainParts, hostParts, userParts, passwordParts;
  var location = Object.assign({}, window.location);
  var blob;
  url = url || location.href;
  if (/^blob\:/i.test(url)) {
    blob = parseUrl(url.replace(/^blob\:/i, ''));
    return Object.assign(blob, {
      'protocol': 'blob:',
      'href': 'blob:' + blob.href,
      'host': '',
      'hostname': '',
      'port': '',
      'pathname': blob.origin + blob.pathname
    });
  }
  if (/^(\:)?\/\//.test(url)) {
    url = (url = url.replace(/^\:/, '')) === '//' ? location.origin : location.protocol + url;
  } else if (/^(\?|\#|\/)/.test(url)) {
    url = location.origin + url;
  } else if (!/\:\/\//.test(url)) {
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
  parts.href = (userParts ? parts.protocol + '//' + parts.username + ':' + parts.password + '@' + parts.host : parts.origin) + parts.pathname + parts.search + parts.hash;
  return parts;
};
APR['stringToJSON'] = src_lib_stringToJSON = function stringToJSON(string) {
  var json;
  if (typeof string !== 'string') {
    return {};
  }
  try {
    json = JSON.parse(string) || {};
  } catch (exception) {
    return {};
  }
  return json;
};
}());