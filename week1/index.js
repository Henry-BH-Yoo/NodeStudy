const http=  require('http');
const url = require('url');
const qs = require('querystring');

const app = http.createServer(function(request , response){
    let _url = request.url;

    let paramData;
    let tempData = '';
    if(request.method == 'GET') {
        paramData = url.parse(_url , true).query;
        console.log(paramData);
    } else if(request.method == 'POST') {
        request.on('data' , function(data){
            tempData += data.toString();
        });

        request.on('end' , function(){
            paramData = qs.parse(tempData);
        });
    }

    setTimeout(function(){
        console.log(paramData);
        response.writeHead(200);

        let temp = `
    
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Node Form Test</title>
            <link rel="stylesheet" href="./css/style.css" />
        </head>
        <body>
            <div class="pop_layer">
                <header> 나의 메모 </header>
                <main>
                    <div><label for="name" class="label1">작성자:</label> ${paramData.name} </div>
                    <div><label for="date" class="label1">작성일시:</label> ${paramData.date} </div>
                    <div><label for="content">내용 </label></div>
                    <div class="align_center"><textarea id="content" name="content" rows="5" cols="36"> ${paramData.content}</textarea></div>
                    <div class="align_center">
                        정상적으로 전송되었습니다.
                    </div>
                </main>
            </div>
        </body>
        </html>
        `;


        response.end(temp);

    },100 );

});
app.listen(3000);