define('APR', function () {

	'use strict';

	var APR = {};

	return Object.defineProperties(APR, /** @lends APR */{
		// 'version': '%{CORE_VERSION}%',
		'setFn': {
			'value': function setFn (name, fn, propertiesDescriptor) {

				if (propertiesDescriptor) {
					Object.defineProperties(fn, propertiesDescriptor);
				}

				Object.defineProperty(APR, name, {
					'value': fn
				});

				return fn;

			}
		},
		'setModule': {
			'value': function setModule (name, fn, propertiesDescriptor,
			prototypeDescriptor) {
			
				APR.setFn(name, fn, propertiesDescriptor);
				
				if (prototypeDescriptor) {
					Object.defineProperties(APR[name].prototype,
						prototypeDescriptor);
				}


				return fn;

			}
		},
		'setProperty': {
			'value': function setProperty (name, descriptor) {
			
				Object.defineProperty(APR, name, descriptor);

				return APR[name];

			}
		}

	});
	
});
