module.exports = {
    'rootDir': '../../', // where package.json lives.
    'moduleNameMapper': {
        '^@src(.*)': '<rootDir>/src$1',
        '^@lib(.*)': '<rootDir>/src/lib$1',
        '^@test(.*)': '<rootDir>/test$1',
        '^@dist(.+)': '<rootDir>/dist$1'
    },
    'globalSetup': '<rootDir>/test/jest/setup.js',
    'globalTeardown': '<rootDir>/test/jest/teardown.js',
    'coverageReporters': ['lcov', 'text-summary'],
    'testEnvironment': 'jsdom',
    'testEnvironmentOptions': {
        'resources': 'usable',
        'url': 'http://127.0.0.1:7890'
    }
};
