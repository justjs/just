var test = require('tape'),
	getRemoteParent = require('../../src/lib/getRemoteParent');

var html = document.getElementsByTagName('html')[0],
	body = document.getElementsByTagName('body')[0];

test('getRemoteParent', function (t) {

	t.test('should go up through the child parents until the expected parent is found', function (st) {

		var child = body;
		var expectedParent = html;
		var parent = getRemoteParent(child, function (deepLevel) {
			st.is(this instanceof Node);
			st.is(deepLevel instanceof Number);
			return this === expectedParent;
		});

		st.is(parent, expectedParent);

		st.end();

	});

	t.test('should return `null` if the expected parent is not found', function (st) {

		var parent = getRemoteParent(html, function () {
			return false;
		});

		st.is(parent, null);
		st.end();

	});

	t.test('should use the html root if the given child is not an instance of Node', function (st) {
		
		var child = window;

		st.plan(1);

		getRemoteParent(child, function () {
			st.is(this, html);
		});

	});

	t.test('should throw if no function is given', function (st) {

		st.throws(getRemoteParent(body), TypeError);
		st.end();

	});

	t.test('should return the child if the expected parent is the child with a `deepLevel` of 0 and `includeChild` is a truthy value', function (st) {
			
		var includeChild = true;
		var child = body;
		var expectedParent = child;
		var parent = getRemoteParent(child, function (deepLevel) {
			return this === child && deepLevel === 0;
		}, includeChild);

		st.is(parent, child);

		st.end();

	});

	t.test('should count the number of checked elements', function (st) {
	
		var expectedDeepLevels = {
			'DIV': 0,
			'BODY': 1,
			'HTML': 2
		};
		var div = document.createElement('div');

		body.appendChild(div);

		getRemoteParent(div, function (deepLevel) {
			st.is(deepLevel, expectedDeepLevels[this.tagName]);
		});

		st.end();

	});

});