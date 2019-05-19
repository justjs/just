var test = require('tape'),
	createPrivateKey = require('../../src/lib/createPrivateKey');

test('createPrivateKey', function (t) {

	t.test('should extend the prototype chain of an `Object`', function (st) {

		var privateStore = createPrivateKey({
			
			'getContext': function () {
				return this;
			}

		}, String)({});

		st.is(privateStore.getContext(), {
			'prototype': String.prototype
		});

		st.end();

	});

	t.test('should create a private store', (function () {

		var getContext = function () {
			return this;
		};

		function Public () {
			this.a = 'public';
		}

		Public.prototype.publicMethod = getContext;

		return function (st) {

			var key = {};
			var privateStore = createPrivateKey({
				'privateMethod': getContext
			}, Public)(key);

			privateStore.b = 'private';
			
			console.log(privateStore.publicMethod());

			st.deepEquals(privateStore.publicMethod(), {
				'a': 'public',
				'publicMethod': getContext
			});

			console.log(privateStore.privateMethod());

			st.deepEquals(privateStore.privateMethod(), {
				'a': 'public',
				'b': 'private',
				'privateMethod': getContext,
				'prototype': Public.prototype
			});

			st.end();

		};

	})());

	t.test('should create a store for each given key', function (st) {

		var storeA = createPrivateKey(), keyA = {};
		var storeB = createPrivateKey(), keyB = {};

		storeA(keyA).store = 'A';
		storeB(keyB).store = 'B';

		st.is(storeA(keyA).store, 'A');
		st.is(storeB(keyB).store, 'B');

		st.is(storeA(keyB).store, void 0);
		st.is(storeB(keyA).store, void 0);

		st.end();

	});

	t.test('should throw if the given key is not an instance of an `Object`', function (st) {

		var notAnInstanceOfObject = null;
		var privateStore = createPrivateKey()(notAnInstanceOfObject);

		st.throws(privateStore, TypeError);

		st.end();

	});

});