module.exports = {
	'moduleNameMapper': {
		'^@src(.*)': '<rootDir>/src$1',
		'^@lib(.*)': '<rootDir>/src/lib$1',
		'^@test(.*)': '<rootDir>/test$1'
	},
	'testEnvironmentOptions': {
		'resources': 'usable'
	}
};
