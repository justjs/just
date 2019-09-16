var test = require('tape'),
	createPrivateKey = require('../../src/lib/createPrivateKey');

test('lib/createPrivateKey.js', function (t) {

	t.test('Should create a private store.', function (st) {

		var _ = createPrivateKey();
		var public = new (function Public () {
			this.publicProperty = 'public';
			_(this).privateProperty = 'private';
		});

		st.is(typeof public.privateProperty, 'undefined');
		st.is(_(public).privateProperty, 'private');

		st.end();

	});

	t.test('Should extend the prototype chain of an object.',
		(function () {

		function Public () {
			this.a = 'public';
		}

		Public.prototype.publicMethod = function () {};

		return function (st) {

			var key = {};
			var _ = createPrivateKey({
				
				'privateMethod': function () {
					st.is(typeof this.publicMethod, 'function');
				}

			}, Public);

			st.is(typeof _(key).privateMethod, 'function');
			st.is(typeof _(key).publicMethod, 'function');
			st.is(typeof _(key).a, 'undefined');

			_(key).privateMethod();

			st.end();

		};

	})());

	t.test('Should create a store for each given key.',
		function (st) {

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

	t.test('Should throw if the given key is not an instance of ' +
		'an Object.', function (st) {

		var notAnInstanceOfObject = null;
		var _ = createPrivateKey();

		st.throws(function () {
			_(notAnInstanceOfObject);
		}, TypeError);

		st.end();

	});

	t.test('Should not privatize an object twice.', function (st) {
		
		var _ = createPrivateKey();
		var object = {};

		st.is(_(_(object)), _(object));

		st.end();

	});

	t.end();

});