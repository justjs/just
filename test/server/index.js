var fs = require('fs');
var http = require('http');
var path = require('path');
var server = http.createServer(function (req, res) {

    var publicDir = path.join(__dirname, 'public');
    var file = path.join(publicDir, req.url);

    fs.readFile(file, function (error, data) {

        if (error) {

            res.writeHead(500);
            res.end(JSON.stringify(error));

            return;

        }

        res.writeHead(200);
        res.end(data);

    });

});

server.listen(7890, '0.0.0.0', function () {

    var address = this.address();

    console.log('Listening on ' + address.address + ':' + address.port);

});

module.exports = server;
