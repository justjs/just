;(function() {
var APR, core, server, isKeyValueObject, hasOwn, eachProperty, defaults, access, isWindow, createPrivateKey, isEmptyObject, isJSONLikeObject, parseUrl, stringToJSON;
APR = { 'version': '0.2.0' };
core = undefined;
server = Object.assign(APR, {});
APR['isKeyValueObject'] = isKeyValueObject = function isKeyValueObject(value) {
  return /(^\{|\}$)/.test(JSON.stringify(value));
};
APR['hasOwn'] = hasOwn = function hasOwn(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
};
APR['eachProperty'] = eachProperty = function eachProperty(properties, fn, thisArg, strict) {
  var returnedValues = {};
  var k;
  for (k in properties) {
    if (strict || hasOwn(properties, k)) {
      returnedValues[k] = fn.call(thisArg, properties[k], k, properties);
    }
  }
  return returnedValues;
};
APR['defaults'] = defaults = function defaults(value, defaultValue, ignoreDefaultKeys) {
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
APR['access'] = access = function access(object, path, handler, mutate) {
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
APR['isWindow'] = isWindow = function isWindow(object) {
  return object === window || isKeyValueObject(object) && object.document && object.setInterval;
};
APR['createPrivateKey'] = createPrivateKey = function createPrivateKey(factory, parent) {
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
APR['isEmptyObject'] = isEmptyObject = function isEmptyObject(object) {
  var obj = Object(object);
  var k;
  for (k in obj) {
    if (hasOwn(obj, k)) {
      return false;
    }
  }
  return true;
};
APR['isJSONLikeObject'] = isJSONLikeObject = function (isKeyValueObject) {
  return isKeyValueObject;
}(isKeyValueObject);
APR['parseUrl'] = parseUrl = function parseUrl(url) {
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
APR['stringToJSON'] = stringToJSON = function stringToJSON(string) {
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
window.APR = APR;
}());