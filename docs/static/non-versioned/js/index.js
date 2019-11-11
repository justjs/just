var setAttributes = function (element, attributes) {
	for (var name in attributes) {
		if (({}).hasOwnProperty.call(attributes, name)) {
			element.setAttribute(name, attributes[name]);
		}
	}
};
var find = function (s, p) {
	return [].slice.call((p || document).querySelectorAll(s));
};
var create = function (tagName, attributes, text) {
	var element = document.createElement(tagName);

	setAttributes(element, attributes);

	if (typeof text === 'string') {
		element.textContent = text;
	}

	return element;
};
var availableVersions = document.documentElement.getAttribute('data-available-versions').split(' ');

find('.available-versions-list').forEach(function (container, i) {
	availableVersions.forEach(function (version) {
		var li = create('li');
		var a = create('a', {
			'href': './' + version + '/index.html'
		}, version);

		li.appendChild(a);
		container.appendChild(li);
	});
});
