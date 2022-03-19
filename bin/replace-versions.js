#!/usr/bin/env node
var semverSort = require('semver/functions/sort');
var childProcess = require('child_process');
var nunjucksConfig = require('../nunjucks.config.js');
var nunjucks = nunjucksConfig.render.context;
var version = nunjucks.version;
var execSync = childProcess.execSync;
var availableVersions = semverSort([version].concat(nunjucks.getAvailableVersions()).reduce(function (unique, v) {

    if (unique.indexOf(v) > -1) { return unique; }

    return unique.concat(v);

}, [])).reverse();
var markup = '<select id="versions">' + availableVersions.map(function (v) { return '<option value="' + v + '"' + (v === version ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select>';
var source = 'docs/public/*/';

// Replace or add #versions.
execSync('find ' + source + ' -type f | while read file; do if grep -q \'id="versions"\' "$file"; then sed -i -E \'s@<select id="versions">.*</select>@' + markup + '@\' "$file"; else sed -i -E \'s@<nav@' + markup + '<nav@\' "$file"; fi; done');
