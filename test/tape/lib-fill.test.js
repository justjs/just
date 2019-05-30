var test = require('tape'),
	fill = require('../../src/lib/fill');

test('lib/fill.js', function (t) {

	t.test('Should fill a key-value object.',
		function (st) {

		var structure = {
			'saved': void 0
		};
		var data = {
			'saved': 'data',
			'new': 'data'
		};
		var expected = {
			'saved': 'data'
		};
		var preserveUndefined = false;

		st.deepEquals(
			fill(structure, data, preserveUndefined),
			expected,
			'The structure was preserved, although `undefined` ' +
			'values got replaced.'
		);

		st.end();

	});

	t.test('Should throw if the provided values are not the expected ' +
		'values.', function (st) {

		st.plan(4);

		st.throws(function () {
			fill([], {});
		}, TypeError, 'The structure is not a key-value object.');

		st.throws(function () {
			fill({}, '');
		}, TypeError, 'The data is not a key-value object.');

		st.doesNotThrow(function () {
			fill({}, null);
		}, TypeError, '`null` data is fine, though.');

		st.doesNotThrow(function () {
			fill({});
		}, TypeError, '`undefined` data is fine too.');

	});

	t.test('Should preserve `undefined` values.', function (st) {

		var preserveUndefined = true;
		var structure = {
			'saved': void 0
		};
		var data = {
			'saved': ''
		};

		st.is(
			typeof fill(structure, data, preserveUndefined).saved,
			'undefined',
			'`undefined` values were not replaced since a third ' +
			'truthy argument was passed.'
		);

		st.end();

	});

	t.test('Should preserve the structure if the given data ' +
		'doesn\'t match the structure.', function (st) {

		var structure = {
			'structure': ''
		};
		var data = {
			'data': ''
		};
		var expected = {
			'structure': ''
		};

		st.deepEquals(
			fill(structure, data),
			expected,
			'The structure is the same.'
		);

		st.end();

	});

	t.test('Should fill arrays in the object.', function (st) {

		var filledObject = fill({
			'array': ['saved']
		}, {
			'array': 'new'
		});

		st.deepEquals(filledObject, {
			
			'array': ['saved', 'new']

		}, 'Arrays get filled by pushing the given data to the value.');

		st.end();

	});

	t.test('Should fill an structure with `undefined` values.',
		function (st) {

		st.is(
			typeof fill({'a': 5}, {'a': void 0}).a,
			'undefined',
			'The property was replaced by an `undefined` value.'
		);

		st.end();

	});

});