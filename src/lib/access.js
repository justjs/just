define([
	'./defaults',
	'./isKeyValueObject'
], function (defaults, isKeyValueObject) {
	
	'use strict';

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
	return function access (object, path, handler, mutate) {

		var propertyExists = true;
		var baseObject = mutate ? object : Object.assign({}, object);
		var currentObject = baseObject;
		var lastKey;

		path = defaults(path, [path]);
		lastKey = path[path.length - 1];

		path.slice(0, -1).map(function (key, i) {

			currentObject = typeof currentObject[key] !== 'undefined' ? currentObject[key] : ((propertyExists = false), {});

			if (currentObject !== null && !isKeyValueObject(currentObject)) {
				throw new TypeError('The value of "' + key + '" is not a "key-value" object.');
			}

		});

		return handler ? handler.call(baseObject, currentObject, lastKey, propertyExists, path) : currentObject[lastKey];

	};

});