;(function() {
var APR, src_browser, src_lib_polyfills, src_lib_isKeyValueObject, src_lib_hasOwn, src_lib_eachProperty, src_lib_defaults, src_lib_access, APRDefine, src_lib_APRDefine, APRLocalStorage, src_lib_APRLocalStorage, src_lib_isWindow, src_lib_createPrivateKey, src_lib_getElements, src_lib_getFunctionName, src_lib_getPressedKey, src_lib_var_body, src_lib_var_html, src_lib_getRemoteParent, src_lib_isEmptyObject, src_lib_isJSONLikeObject, src_lib_isTouchDevice, src_lib_var_head, src_lib_parseUrl, src_lib_loadElement, src_lib_setDynamicKeys, src_lib_stringToJSON;
APR = { 'version': '0.2.0' };
src_browser = undefined;
/**
 * Some polyfills (for ie8) used in 2 o more APR modules.
 * @ignore
 */
(function (W, D, O, S, A, F, E, V, L) {
  'use strict';
  function fp(c, p, f, n) {
    var o = c[p];
    o = o || f;
    o.APRPolyfill = f === o ? null : f;
  }
  function fl(o) {
    /* Based on: mozilla & github/jonathantneal/EventListener */
    var _ = [];
    fp(o, 'addEventListener', function (t, l) {
      var s = this, fa = function (s, t, f) {
          s.attachEvent('on' + t, f);
          _.push({
            s: s,
            t: t,
            l: l,
            f: f
          });
        }, f1 = function (e) {
          var h = l.handleEvent, H = D.documentElement;
          e = e || W.event;
          fp(e, 'target', e.srcElement || s);
          fp(e, 'currentTarget', s);
          fp(e, 'relatedTarget', e.fromElement);
          fp(e, 'timeStamp', +new Date());
          fp(e, 'pageX', e.clientX + H.scrollLeft);
          fp(e, 'pageY', e.clientY + H.scrollTop);
          h ? h(e) : l.call(s, e);
        }, f2 = function (e) {
          if (D.readyState != 'complete') {
            if (e != 0)
              return f1(e);
            e = new Event(t);
            e.srcElement = W;
            f2(e);
          }
        };
      t != 'DOMContentLoaded' ? fa(s, t, f1) : fa(D, 'readystatechange', f2), f2(0);
    });
    fp(o, 'removeEventListener', function (t, l) {
      var i = _.length, h;
      while (--i >= 0)
        if ((h = _[i]).s == this && h.t == t && h.l == l && h.s.detachEvent('on' + (t == 'DOMContentLoaded' ? 'readystatechange' : t), h.f))
          break;
    });
  }
  function fy(o) {
    return o.prototype;
  }
  function ff(o, f) {
    for (var k in o)
      fy(O).hasOwnProperty.call(o, k) && f(k, o[k]);
  }
  function fg(o, p, g) {
    O.defineProperty ? O.defineProperty(o, p, { get: g }) : o.__defineGetter__(p, g);
  }
  function fv(o, p) {
    var v = [
        'moz',
        'webkit',
        'ms',
        'o'
      ], i = v.length, fn;
    while (--i >= 0)
      if (fn = o[p + v[i]])
        return fn;
  }
  function fd(o) {
    fp(o, 'dispatchEvent', function (e) {
      return this.fireEvent('on' + e.type, e);
    });
  }
  fp(W, 'Event', !fy(V) || !fy(V).constructor.name ? function (t, o) {
    var D = document, e, b, c;
    o = o && typeof o == 'object' ? o : {};
    b = !!o.bubbles;
    c = !!o.cancelable;
    if ('createEvent' in D)
      return (e = D.createEvent('Event')).initEvent(t, b, c), e;
    e = D.createEventObject();
    e.type = t;
    e.bubbles = b;
    e.cancelable = c;
    return e;
  } : V);
  fp(W, 'CustomEvent', W.CustomEvent && typeof W.CustomEvent == 'object' ? function (t, o) {
    var W = window, D = W.document, e = D.createEvent('CustomEvent');
    o = o && typeof o == 'object' ? o : {};
    e.initCustomEvent(t, !!o.bubbles, !!o.cancelable, o.detail);
    return e;
  } : W.CustomEvent || function (t, o) {
    var e = new Event(t, o);
    e.detail = (o && typeof o == 'object' ? o : {}).detail;
    return e;
  });
  fp(W, 'WeakMap', function () {
    var s = {}, i = 0, t = this.prototype;
    t.set = function (k, v) {
      s[k._weakMapID = i++] = v;
    };
    t.get = function (k) {
      return s[k._weakMapID];
    };
    t.has = function (k) {
      return k._id in s;
    };
    t.delete = function (k) {
      delete s[k._weakMapID];
    };
  });
  fp(Number, 'isNaN', function (v) {
    /* source: mozilla */
    return v !== v;
  });
  fp(O, 'assign', function (o) {
    var a = arguments, i = a.length, k, v;
    o = Object(o);
    while (--i >= 1)
      for (k in a[i])
        if (Object.prototype.hasOwnProperty.call(v = a[i][k], k))
          o[k] = v;
    return o;
  });
  fp(O, 'create', function (p, _) {
    function fn() {
    }
    fn.prototype = p;
    return new fn();
  });
  fp(O, 'keys', function (o) {
    var r = [], k, v;
    for (k in o)
      v = o[k] && Object.prototype.hasOwnProperty.call(o, k) && r.push(k);
    return r;
  });
  fp(O, 'values', function (o) {
    var r = [], k, v;
    for (k in o)
      v = o[k] && Object.prototype.hasOwnProperty.call(o, k) && r.push(v);
    return r;
  });
  fp(A, 'isArray', function (a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  });
  fp(A, 'from', function (a, fn, t) {
    var s = this, l = Object(a), f = l.length >>> 0, r = typeof s == 'function' ? O(new s(f)) : new Array(f), i = -1;
    while (++i < f)
      r[i] = fn ? fn.call(t, l[i], i) : l[i];
    r.length = f;
    return r;
  });
  fp(fy(S), 'trim', function () {
    /* source: mozilla */
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  });
  fp(fy(A), 'filter', function (fn) {
    var t = this, i = 0, f = t.length >>> 0, r = [], v;
    for (; i < f; i++)
      fn(v = t[i], i, t) && r.push(v);
    return r;
  });
  fp(fy(A), 'indexOf', function (k, i) {
    var t = this, f = t.length >>> 0;
    i = i << 0;
    for (i += i < 0 ? f : 0; i < f; i++)
      if (t[i] === k)
        return i;
    return -1;
  });
  fp(fy(A), 'forEach', function (fn, t) {
    var s = Object(this), n = s.length, i;
    for (i = 0; i < n; i++)
      fn.call(t, s[i], i, s);
  });
  fp(fy(A), 'map', function (fn, t) {
    var s = Object(this), n = s.length, r = [], i;
    for (i = 0; i < n; i++)
      r.push(fn.call(t, s[i], i, s));
    return r;
  });
  fp(fy(A), 'some', function (fn, t) {
    var s = Object(this), f = s.length >>> 0, k;
    for (k = 0; k < f; k++) {
      if (fn.call(t, s[k], k, s))
        return !0;
    }
    return !1;
  });
  fp(fy(A), 'find', function (fn, t) {
    var s = Object(this), f = s.length >>> 0, k, v;
    for (k = 0; k < f; k++) {
      if (fn.call(t, v = s[k], k, s))
        return v;
    }
    return void 0;
  });
  fp(fy(F), 'bind', function (t) {
    var a = Array.prototype.slice.call(arguments, 1), b = this, fa = function () {
      }, fb = function () {
        return b.apply(this instanceof fa ? this : t, a.concat(Array.prototype.slice.call(arguments)));
      };
    fa.prototype = this.prototype;
    fb.prototype = new fa();
    return fb;
  });
  fp(fy(V), 'preventDefault', function () {
    this.cancelable && (this.returnValue = !1);
  });
  fp(fy(V), 'stopPropagation', function () {
    this.cancelBubble = !0;
  });
  fp(fy(V), 'stopImmediatePropagation', function () {
    this.cancelBubble = this.cancelImmediate = !0;
  });
  fp(L, 'origin', function () {
    return this.protocol + '//' + this.host;
  });
  fp(L, 'toString', function () {
    return this.href;
  });
  if (!fy(E)['addEventListener'])
    fl(fy(Window)), fl(fy(E)), fl(fy(HTMLDocument)), fd(fy(Window)), fd(fy(E)), fd(fy(HTMLDocument));
  ff(function (fs) {
    return {
      previousElementSibling: function () {
        return fs(this, 'previous');
      },
      nextElementSibling: function () {
        return fs(this, 'next');
      }
    };
  }(function fs(e, k) {
    while ((e = e[k + 'Sibling']) && e.nodeType != 1);
    return e;
  }), function (k, v) {
    v in D.documentElement || fg(fy(E), k, v);
  });
  !function (g) {
    var fs = function (t) {
        return fy(A).join.call(t, ' ');
      }, fi = function (t, s) {
        return (' ' + fs(t) + ' ').indexOf(' ' + s + ' ');
      }, fv = function (s) {
        if (!(s = s + '') || /\s/.test(s))
          throw Error('"' + s + '" is invalid');
        return s;
      }, ft = function (s, f) {
        var t = this;
        return t.contains(s) ? (f === !1 && t.remove(s), !1) : (f === !0 && t.add(s), !0);
      }, fe = function () {
        return fy(A).filter.call(this, function (v, k) {
          return !isNaN(k);
        });
      }, fc = function (s) {
        return !/\s/.test(s) && fi(this, s) >= 0;
      }, fr = function (a, b) {
        var t = this;
        if (!b)
          throw TypeError('Not enough arguments');
        return t.contains(a = fv(a)) && (b = fv(b)) && (t.remove(a), t.add(b), !0);
      }, fh = function (f, s) {
        var t = this;
        ff(fe.call(t), function (k, v) {
          f.call(s, v, +k, t);
        });
      }, fk = function () {
        return O.keys(fe.call(this));
      }, fT = function (e) {
        var t = this;
        t.value = (e.getAttribute('class') || '').trim();
        t.length = t.value ? fy(A).push.apply(t, t.value.split(/\s+/)) : 0;
        t.element = e;
        fy(fT).toString = function () {
          return fs(this);
        };
        fy(fT)._values = fy(fT)._entries = fe;
        fy(fT)._keys = fk;
      }, _ = D.createElementNS('http://www.w3.org/2000/svg', 'g'), p = 'classList';
    fp(W, g, fT);
    p in _ || fg(fy(E), p, function () {
      return new W[g](this);
    });
    fp(fy(fT), 'add', function () {
      var t = this, a = arguments, i, s;
      for (i = 0; i < a.length; i++)
        t.contains(s = fv(a[i])) || (fy(A).push.call(t, s), t.element.setAttribute('class', fs(t)));
    });
    fp(fy(fT), 'remove', function () {
      var t = this, a = arguments, i = a.length, s;
      while (--i >= 0)
        if (t.contains(s = fv(a[i]))) {
          fh.call(t, function (v, k) {
            v === s && fy(A).splice.call(t, k, 1);
          });
          t.element.setAttribute('class', fs(t));
        }
    });
    fp(fy(fT), 'item', function (i) {
      return this[i] || null;
    });
    fp(fy(fT), 'contains', fc);
    fp(fy(fT), 'replace', fr);
    fp(fy(fT), 'toggle', ft);
    fp(fy(fT), 'forEach', fh);
    _[p].add('a', 'b');
    _[p].contains('b') || (fy(W[g]).contains = fc);
    _[p].toggle('c', !1) || (fy(W[g]).toggle = ft);
    _ = null;
  }('DOMTokenList');
  fp(fy(E), 'matches', fy(E).matchesSelector || fv(fy(E), 'MatchesSelector') || function (s) {
    var t = this, m = (t.document || t.ownerDocument).querySelectorAll(s);
    while (--i >= 0 && m[i] !== t);
    return i > -1;
  });
  /* based on: https://gist.github.com/paulirish/1579671 */
  fp(W, 'requestAnimationFrame', fv(W, 'RequestAnimationFrame') || function (l) {
    return function (fn) {
      var n = +new Date(), c = Math.max(0, 16 - n - l), i = W.setTimeout(function () {
          fn(n + c);
        }, c);
      l = n + c;
      return i;
    };
  }(0));
  fp(W, 'cancelAnimationFrame', fv(W, 'CancelAnimationFrame') || fv(W, 'CancelRequestAnimationFrame') || function (i) {
    clearTimeout(i);
  });
}(window, document, Object, String, Array, Function, Element, Event, Location));
src_lib_polyfills = undefined;
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
APR['Define'] = APRDefine = function (head, access, eachProperty, loadElement, createPrivateKey, getElements) {
  var _ = function () {
    var STATE_DEFINED = 'defined', STATE_CALLED = 'called';
    var modules = {
      'defined': {},
      'currentlyLoadingIDs': []
    };
    function addLoadingModule(id) {
      var moduleLoadingIDs = modules.currentlyLoadingIDs;
      if (moduleLoadingIDs.indexOf(id) >= 0) {
        return -1;
      }
      return modules.currentlyLoadingIDs.push(id);
    }
    function removeLoadingModule(id) {
      var moduleLoadingIDs = modules.currentlyLoadingIDs;
      return moduleLoadingIDs.splice(moduleLoadingIDs.indexOf(id), 1);
    }
    function getModule(id) {
      return modules.defined[id] || access(window, id.split(APRDefine.ID_SEPARATOR));
    }
    function callModule(someModule) {
      var id = someModule.id;
      var dependencyIDs = someModule.dependencyIDs;
      var dependencies;
      if (someModule.state === STATE_CALLED) {
        return true;
      }
      dependencies = dependencyIDs.map(function (dependencyID) {
        return getModule(dependencyID);
      });
      if (dependencies.some(function (isDefined) {
          return !isDefined;
        })) {
        return false;
      }
      defineModule.handler.apply(null, dependencies);
      someModule.state = STATE_CALLED;
      return true;
    }
    function callModules(modules, state) {
      var results = {};
      eachProperty(modules, function (someModule, id) {
        if (!state || someModule.state === state) {
          results[id] = callModule(someModule);
        }
      });
      return results;
    }
    function updateModules() {
      var definedModules = modules.defined;
      var moduleLoadingIDs = modules.currentlyLoadingIDs;
      var calledModuleIDs = [];
      var calledModules = {};
      var nonDefinedModules = [];
      if (moduleLoadingIDs.length) {
        return false;
      }
      calledModules = callModules(definedModules, STATE_DEFINED);
      if (Object.values(calledModules).some(function (wasCalled) {
          return wasCalled;
        })) {
        return updateModules();
      }
      calledModuleIDs = Object.keys(calledModules);
      nonDefinedModules = calledModuleIDs.filter(function (id) {
        return !getModule(id);
      });
      if (nonDefinedModules.length) {
        throw new Error('The following modules weren\'t defined: ' + nonDefinedModules);
      } else {
        throw new Error('Something went wrong. The following modules weren\'t loaded: ' + calledModuleIDs);
      }
      return true;
    }
    return Object.assign({
      'addLoadingModule': addLoadingModule,
      'removeLoadingModule': removeLoadingModule,
      'updateModules': updateModules
    }, createPrivateKey({
      'defineModule': function (id, dependencyIDs, handler) {
        if (typeof id !== 'string') {
          throw new TypeError('The id must be a string');
        }
        if (!Array.isArray(dependencies)) {
          throw new TypeError('The dependencies must be an Array');
        }
        if (typeof handler !== 'function') {
          throw new TypeError('The handler must be a function');
        }
        removeLoadingModule(id);
        Object.assign(this, {
          'state': STATE_DEFINED,
          'id': id,
          'dependencyIDs': dependencyIDs,
          'handler': handler
        });
        modules.defined[id] = this;
        updateModules();
        return this;
      }
    }, APRDefine));
  }();
  function APRDefine(id, dependencies, handler) {
    if (!(this instanceof APRDefine)) {
      return new APRDefine(id, dependencies, handler);
    }
    if (typeof dependencies === 'function') {
      handler = dependencies;
      dependencies = [];
    } else if (typeof dependencies === 'string') {
      dependencies = [dependencies];
    }
    _(this).defineModule(id, dependencies, handler);
  }
  Object.assign(APRDefine, {
    'ID_SEPARATOR': '/',
    'ATTRIBUTE_NAME': 'data-APR-define',
    'load': function (urls) {
      var loadElementHandler = function (moduleID) {
        var onLoad = function () {
          _.removeLoadingModule(moduleID);
          _.updateModules();
        };
        _.addLoadingModule(moduleID);
        return function (isLoaded) {
          if (isLoaded) {
            return onLoad(), void 0;
          }
          this.onload = function () {
            this.onload = null;
            this.onerror = null;
            onLoad();
          };
          this.onerror = function (error) {
            throw error;
          };
          head.appendChild(this);
        };
      };
      if (!isKeyValueObject(urls)) {
        throw new TypeError(urls + ' must be a key-value object.');
      }
      eachProperty(urls, function (url, moduleID) {
        loadElement('script', url, loadElementHandler(moduleID));
      });
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
    'findScriptsToDefine': function () {
      getElements('*[' + APRDefine.ATTRIBUTE_NAME + ']').forEach(function (element) {
        var url = stringToJSON((element.getAttribute(APRDefine.ATTRIBUTE_NAME) || '').replace(/\[([^\]]+)\]/gi, function (_, attributeName) {
          return element.getAttribute(attributeName);
        }));
        APRDefine.load(url);
      });
    }
  });
  return APRDefine;
}(var_head, access, eachProperty, loadElement, createPrivateKey, getElements);
APR['Define'] = src_lib_APRDefine = undefined;
APR['LocalStorage'] = APRLocalStorage = function (createPrivateKey, defaults, eachProperty) {
  var _ = createPrivateKey();
  function APRLocalStorage(consent) {
    if (!(this instanceof APRLocalStorage)) {
      return new APRLocalStorage(consent);
    }
    _(this).consent = !!consent;
  }
  Object.assign(APRLocalStorage, {
    'cookieExists': function (cookie) {
      return new RegExp('; ' + cookie + '(=|;)').test('; ' + document.cookie + ';');
    },
    'getCookie': function (name) {
      return ('; ' + document.cookie).split('; ' + name + '=').pop().split('; ').shift().split(/^=/).pop();
    }
  });
  Object.assign(APRLocalStorage.prototype, {
    'setCookie': function (name, value, options, insecure) {
      var cookie = '', set = function (k, v) {
          cookie += k + (typeof v !== 'undefined' ? '=' + v : '') + '; ';
        };
      if (!_(this).consent) {
        return false;
      }
      options = defaults(options, {});
      set(name, value);
      if (!insecure) {
        set('secure');
      }
      if (options['max-age']) {
        options.expires = +new Date() + options['max-age'] * 1000;
      }
      if (options.expires) {
        options.expires = new Date(options.expires).toGMTString();
      }
      eachProperty(options, function (v, k) {
        set(k, v);
      });
      document.cookie = cookie;
      return true;
    },
    'removeCookie': function (name, options) {
      if (!APRLocalStorage.cookieExists(name)) {
        return true;
      }
      return this.setCookie(name, '', Object.assign(defaults(options, {}), { 'max-age': 0 }));
    },
    'isStorageAvailable': function (type) {
      var _ = 'x';
      var storage;
      if (!_(this).consent) {
        return false;
      }
      try {
        storage = window[type];
        storage.setItem(_, _);
        storage.removeItem(_);
      } catch (exception) {
        return false;
      }
      return true;
    }
  });
  return APRLocalStorage;
}(createPrivateKey, defaults, eachProperty);
APR['LocalStorage'] = src_lib_APRLocalStorage = undefined;
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
APR['getElements'] = src_lib_getElements = function getElements(selector, parent) {
  return Array.from((parent || document).querySelectorAll(selector));
};
APR['getFunctionName'] = src_lib_getFunctionName = function getFunctionName(fn) {
  var matches;
  if (typeof fn !== 'function') {
    throw new TypeError(fn + ' is not a function.');
  }
  if ('name' in fn) {
    return fn.name;
  }
  matches = fn.toString().match(/function([^\(]+)\(+/i);
  return matches ? matches[1].trim() : '';
};
APR['getPressedKey'] = src_lib_getPressedKey = function getPressedKey(e) {
  return e.key || e.code || e.which || e.keyCode;
};
APR['body'] = src_lib_var_body = function (getElements) {
  /**
  * The first body element of the current document.
  * @type {Element}
  * @readOnly
  */
  return getElements('body')[0];
}(src_lib_getElements);
APR['html'] = src_lib_var_html = function (body) {
  /**
  * The html element of the current document.
  * @type {Element}
  * @readOnly
  */
  return document.documentElement || body.parentNode;
}(src_lib_var_body);
APR['getRemoteParent'] = src_lib_getRemoteParent = function (html) {
  /**
  * A function that checks if `this` is the Node that you're looking for.
  * 
  * @typedef {function} APR~getRemoteParent_fn
  * @this {Node}
  * @param {!Number} deepLevel A counter that indicates how many elements have checked.
  * @return {boolean}
  */
  /**
  * Goes up through the `childNode` parents, until `fn` returns `true`
  * or a non-Node is found.
  * 
  * @param  {Node} childNode Some child.
  * @param  {APR~getRemoteParent_fn} fn Some custom handler.
  * @param  {Node} [container=html] The farthest parent.  
  * @param  {boolean} [includeChild=false] If true, it calls `fn` with `childNode` too.
  * @return {?Node} The current Node when `fn` returns true.
  * @example
  * APR.getRemoteParent(APR.body, function () {
  *     return this.tagName === 'HTML';
  * }); // returns the html Element.
  */
  return function getRemoteParent(childNode, fn, container, includeChild) {
    var parentNode = null;
    var deepLevel = 0;
    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not a function.');
    }
    if (!(container instanceof Node)) {
      container = html;
    }
    if (!childNode) {
      return null;
    }
    if (includeChild && fn.call(childNode, deepLevel)) {
      return childNode;
    }
    while ((parentNode = (parentNode || childNode).parentNode) && (parentNode !== container || (parentNode = null)) && !fn.call(parentNode, ++deepLevel));
    return parentNode;
  };
}(src_lib_var_html);
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
APR['isTouchDevice'] = src_lib_isTouchDevice = function isTouchDevice(fn) {
  var isTouch = 'ontouchstart' in body || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 || window.DocumentTouch && document instanceof DocumentTouch;
  if (typeof fn === 'function') {
    window.addEventListener('touchstart', function listener(e) {
      fn(e);
      window.removeEventListener(e.type, listener);
    });
  }
  return isTouch;
};
APR['head'] = src_lib_var_head = function (getElements) {
  /**
  * The first head element of the current document.
  * @type {Element}
  * @readOnly
  */
  return getElements('head')[0];
}(src_lib_getElements);
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
APR['loadElement'] = src_lib_loadElement = function (head, getElements, defaults, parseUrl) {
  /**
  * A custom function to append the created element.
  * 
  * @typedef {function} APR~load_handler
  * @this {!Element} The element that loads the url.
  * @param {?Element} loadedElement An identical element that has been loaded previously.
  * @return {*} Some value.
  */
  /**
  * An src-like attribute for an Element.
  * @typedef {string} APR~load_srcLikeAttribute
  */
  /**
  * A tagName of an Element (such as "link").
  * @typedef {string} APR~element_tag
  */
  /**
  * Loads an external file.
  *
  * @function
  * @param  {APR~element_tag} tag A tag name.
  * @param  {string} url The url of the file.
  * @param  {APR~load_handler} [handler=function () { APR.head.appendChild(element); return this; }] If it's a function: it will be triggered (without appending the element),
  *                                  otherwise: the element will be appended to {@link APR.head|head}.
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
  * @return {*} The return of the {@link APR~load_handler|handler}.
  */
  return Object.assign(function loadElement(tag, url, handler) {
    var element, loadedFile, attribute;
    attribute = loadElement.NON_SRC_ATTRIBUTES[tag] || 'src';
    handler = defaults(handler, function (loadedFile) {
      if (!loadedFile) {
        head.appendChild(this);
      }
      return this;
    });
    loadedFile = getElements(tag + '[' + attribute + '="' + url + '"], ' + tag + '[' + attribute + '="' + parseUrl(url).href + '"]')[0];
    if (loadedFile) {
      return handler.call(element, loadedFile);
    }
    element = document.createElement(tag);
    element[attribute] = url;
    if (tag === 'link') {
      element.rel = 'stylesheet';
    }
    if (parseUrl(url).origin !== window.location.origin && [
        'video',
        'img',
        'script'
      ].indexOf(tag) >= 0) {
      element.setAttribute('crossorigin', 'anonymous');
    }
    return handler.call(element, loadedFile);
  }, { 'NON_SRC_ATTRIBUTES': { 'link': 'href' } });
}(src_lib_var_head, src_lib_getElements, src_lib_defaults, src_lib_parseUrl);
APR['setDynamicKeys'] = src_lib_setDynamicKeys = function (isKeyValueObject) {
  /**
  * Set keys of `object` as if it were an array. (Same as {[variable]: 'value'} in most recent browsers).
  * 
  * @param {*} [object=Object] The base object.
  * @param {Array} properties A pair of values: 2n being the key, 2n + 1 being the value.
  * @throws {TypeError} If the given `properties` are not an array-like.
  * @example
  *
  * var obj = {};
  *
  * ['a', 'b', 'c'].map(function (key, index, array) {
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
  return function setDynamicKeys(object, properties) {
    var i, f, key, value;
    if (!('length' in properties)) {
      throw new TypeError('The given keys are not an array-like.');
    }
    if (!isKeyValueObject(object)) {
      object = {};
    }
    for (i = 0, f = properties.length - 1; i < f; i += 2) {
      key = properties[i];
      value = properties[i + 1];
      object[key] = value;
    }
    return object;
  };
}(src_lib_isKeyValueObject);
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