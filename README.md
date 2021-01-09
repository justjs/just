# Just

*The core for all your javascript projects.*

[![Build Status](https://travis-ci.org/justjs/just.svg?branch=master)](https://travis-ci.org/justjs/just) [![Coverage Status](https://coveralls.io/repos/github/justjs/just/badge.svg?branch=master)](https://coveralls.io/github/justjs/just?branch=master) [![npm version](https://badge.fury.io/js/%40just-js%2Fjust.svg)](https://badge.fury.io/js/%40just-js%2Fjust)

**Just** is a library with a bunch of useful and heavily-used js helpers for your browser and server developments. Visit [justjs.github.io](https://justjs.github.io/) to know more.

## Development

Run ``` npm run dev ``` and wait for Jest to start.

## Testing

- Run ``` npm test ``` to run unit test on --ci mode.
- Run ``` npm run test:unit ``` to run unit tests.
- Run ``` npm run test:integration ``` to run integration tests.
- Run ``` npm run test:dev ``` to run jest on --watch & --coverage mode.
- Run ``` npm run test:jest ``` to run jest.
- Run ``` npm run test:coverage ``` to run ``` npm test ``` on --coverage mode.
- Run ``` npm run test:coverage:coveralls ``` to update coveralls info (internal use only).

## Linting

- Run ``` npm run lint ``` to run eslint.
- Run ``` npm run style ``` to run ``` npm run lint ``` on --fix mode.

## Releasing

Before releasing, make sure your build is perfect by running ``` npm pack ``` or ``` npm run build ```. *—This will build the
distributed files under the /dist directory.*

Then, run ``` npm run doc:check ``` to check and modify the generated documentation. *—The browser will automatically start.*

Later, if everything is correct, run ``` npm run release $next-version ``` *(where ``` $next-version ``` is a valid version in the [semver 2.0 format](https://semver.org/spec/v2.0.0.html)).*

And that's it. You've published to NPM, updated the coveralls info, and pushed the new documentation to staging, ready to be published.

## Documentation

This project generates documentation from the source code.

When you release a new version, the new version gets documented in docs/public, pushed to staging on [another repository](https://github.com/justjs/justjs.github.io), and published to [justjs.github.io](https://justjs.github.io) manually.

Make sure you write valid [JSDOC](https://github.com/jsdoc/jsdoc) documentation on public members, in order to show it on the website.

The following are a list of useful scripts:
- Run ``` npm run doc:dev ``` to update the docs and watch for changes on bin, docs/static and docs/tmpl. This command will generate documentation only on start up. If you need to generate it continuously, use ``` npm run doc:jsdoc:dev ``` instead.
- Run ``` npm run doc v$some-version ``` to document ``` $some-version ``` (don't forget the "v" prefix).
- Run ``` npm run doc:jsdoc ``` to run JSDOC.
- Run ``` npm run doc:jsdoc:dev ``` to watch for changes and update the generated documentation continuously.
- Run ``` npm run doc:minify ``` to minify the generated documentation.

## License

This project is under the [BSD 3-Clause License](LICENSE), unless otherwise stated.
