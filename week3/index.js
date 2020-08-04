const http=  require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const board = require('./board.js');



const app = http.createServer(function(request , response){
    var _url = request.url;
    var _queryData = url.parse(_url , true).query;
    var _pathName = url.parse(_url, true).pathname;

    const mimeType = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.eot': 'appliaction/vnd.ms-fontobject',
        '.ttf': 'aplication/font-sfnt'
    }

    const _ext = path.parse(_url).ext;
    const _staticPath = path.join(__dirname, './static')

    console.log(`${_staticPath}${_url}`);

    if( Object.keys(mimeType).includes(_ext)) {
        fs.readFile(`${_staticPath}${_url}`, (err, data) => {
            console.log(data);
            if (err) {
                response.statusCode = 404;
                response.end('Not found');
            } else {
                response.statusCode = 200
                response.setHeader('Content-Type', mimeType[_ext]);
                response.end(data)
            }
        });

    } else {
        if(_pathName === "/notice") {
            if(request.method === "GET") {
                board.get(request,response);
            } else if (request.method === "POST") {
                board.create(request,response);
            } else if (request.method === "PUT") {
                board.update(request,response);
            } else if (request.method === "DELETE") {
                board.delete(request,response);
            }

            response.end();
        } 
    }
});
app.listen(3000);