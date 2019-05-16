const http = require('http'),
	path = require('path');

const ecstatic = require('ecstatic')(path.join(__dirname, 'public'));
const server = http.createServer(ecstatic);

server.listen(process.env.NODE_PORT);