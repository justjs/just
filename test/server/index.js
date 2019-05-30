const http = require('http'),
	path = require('path');

const ecstatic = require('ecstatic')(path.join(__dirname, 'public'));
const server = http.createServer(ecstatic);
const port = process.env.NODE_PORT;

server.listen(port, () => {
	console.log('Running on port: ' + port);
});