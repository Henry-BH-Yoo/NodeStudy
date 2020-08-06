const http=  require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

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
        if(_pathName === "/imgSliderUsingNode") {
            fs.readFile('./data.txt', 'utf8' , function(err, data) {        
                
                let returnArray = new Array();
                let firstMap = new Object();  

                let tempArr = data.toString().split('\r\n');
                
                for(i in tempArr) {
                    let dataMap = new Object();
                    let objArr = tempArr[i].split('|');
                    
                    dataMap['title'] = objArr[0];
                    dataMap['url'] = objArr[1];
                    dataMap['createdDate'] = objArr[2];

                    returnArray.push(dataMap);
                }

                firstMap = returnArray[0];
                console.log(firstMap);

                let temp = '';
                temp += '<!DOCTYPE html>';
                temp += '<html lang="en">';
                temp += '<head>';
                temp += '<meta charset="UTF-8">';
                temp += '<title> Image Viewer </title>';
                temp += '<link rel="stylesheet" href="./css/style.css" />';
                temp += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tiny-slider/2.9.2/tiny-slider.css">';
                        
                temp += '<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>';
                temp += '<script src="https://cdnjs.cloudflare.com/ajax/libs/tiny-slider/2.9.2/min/tiny-slider.js"></script>';
                temp += '<script src="./js/ui.js"></script>';
                temp += '</head>';
                temp += '<body>';
                temp += '<header>';
                temp += '<h2>Week2 - Image Viewer</h2>';
                temp += '</header>';
                temp += '<section>';
                temp += '<div class="img_viewer">';
                temp += '<div class="img_area">';
                temp += '<img src="' + firstMap['url'] + '" alt="' + firstMap['title'] + '" class="img"/>';
                temp += '<div class="title">' + firstMap['title'] + '</div>';
                temp += '</div>';
                temp += '<div class="navi_area">';
                temp += '<div id="goUp" class="navi_btn">';
                temp += 'UP';
                temp += '</div>';
                temp += '<div class="my-slider">';
                
                for(var i = 0 ; i < returnArray.length; i++) {
                    var dataObj = returnArray[i];
                    temp += '<div><img src="' + dataObj.url + '" alt="' + dataObj.title + '" class="img"></div>';
                }
                
                temp += '</div>';
                
                temp += '<div id="goDown" class="navi_btn">';
                temp += 'DOWN';
                temp += '</div>';
                
                temp += '</div>';
                temp += '</div>';
                temp += '</section>';
                
                
                temp += '</body>';
                temp += '</html>';
                response.writeHead(200 , { 
                    'Content-type': 'text/html'
                })
                response.end(temp , 'utf8');


            });

        } else if(_pathName === "/imgData") {
            if(request.method === "GET") {
                fs.readFile('./data.txt', 'utf8' , function(err, data) {          

                    let outMap = new Object();
                    let returnArray = new Array();
                    

                    let tempArr = data.toString().split('\r\n');
                    
                    for(i in tempArr) {
                        let dataMap = new Object();
                        let objArr = tempArr[i].split('|');
                        
                        dataMap['title'] = objArr[0];
                        dataMap['url'] = objArr[1];
                        dataMap['createdDate'] = objArr[2];

                        returnArray.push(dataMap);
                    }

                    outMap['returnValue'] = returnArray;

                    response.writeHead(200, { 
                        'Content-type': 'application/json'
                    });

                    response.end(JSON.stringify(outMap),'utf8');
                });
            } else if(request.method === "POST") {
                

                console.log("Post로 호출");


            }
        } else if (_pathName === '/remoteData') {
            if(request.method === "GET") {
                let outMap = new Object();

                https.get('https://raw.githubusercontent.com/Henry-BH-Yoo/NodeStudy/master/week2/data.txt' , function(res){

                    let data = '';

                    res.on('data' , function(chunk) {
                        data += chunk.toString('utf8');
                    });


                    res.on('end' , function() {
                        var body = data.toString('utf8').trim();
                        let returnArray = new Array();
                        let tempArr = body.split('\n');                        

                        

                        for(var i = 0 ; i < tempArr.length ; i++) {
                            let dataMap = new Object();
                            let objArr = tempArr[i].split('|');
                            
                            dataMap['title'] = objArr[0];
                            dataMap['url'] = objArr[1];
                            dataMap['createdDate'] = objArr[2];

                            returnArray.push(dataMap);
                        }
                        
                        outMap['returnValue'] = returnArray;

                        response.writeHead(200, { 
                            'Content-type': 'application/json'
                        });
                        response.end(JSON.stringify(outMap),'utf8');

                    });

                }).on('error' , function(e){
                    console.error(e);
                });

            }
        }
    }
});
app.listen(3000);