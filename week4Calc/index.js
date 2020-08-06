const http=  require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const speedCalculator = require('./speedCalculator.js');

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
        if(_pathName === "/speedCalculate") {
            if(request.method === "GET") {
                let from = _queryData.from;
                let to = _queryData.to;
                let reqValue = _queryData.reqValue;
                let result;


                if(from.toUpperCase() === "KM" && to.toUpperCase() === "MILE") {
                    result = speedCalculator.makeKmToMile(reqValue);
                } else if (from.toUpperCase() === "MILE" && to.toUpperCase() === "KM") {
                    result = speedCalculator.makeMileToKm(reqValue);
                }

                let outMap = new Object();
                
                outMap['from'] = from;
                outMap['to'] = to;
                outMap['reqValue'] = reqValue;
                outMap['result'] = result;

                response.writeHead(200, { 
                    'Content-type': 'application/json'
                });

                response.end(JSON.stringify(outMap),'utf8');

            } else if(request.method === "POST") {
                let data = '';
                let paramMap;

                request.on('data' , function(chunk) {
                    data += chunk;
                });

                request.on('end' , function(){
                    paramMap = JSON.parse(data);
                    
                    if(paramMap.from.toUpperCase() === "KM" && paramMap.to.toUpperCase() === "MILE") {
                        result = speedCalculator.makeKmToMile(paramMap.reqValue);
                    } else if (paramMap.from.toUpperCase() === "MILE" && paramMap.to.toUpperCase() === "KM") {
                        result = speedCalculator.makeMileToKm(paramMap.reqValue);
                    }

                    paramMap.result = result;

                    response.writeHead(200, { 
                        'Content-type': 'application/json'
                    });
    
                    response.end(JSON.stringify(paramMap),'utf8');

                });

            }
        }
    }
});
app.listen(3000);