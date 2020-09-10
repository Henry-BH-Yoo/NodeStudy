const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookie = require('cookie-parser');
const {check, validationResult} = require('express-validator');

var constant = require('./constant');

// Routing Variable
const member = require('./member');
const main = require('./main');

require('dotenv').config();

let port = process.env.SERVER_PORT;

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());
app.set('view engine' , 'ejs');
app.set('views', __dirname + '/views');


app.use(session({
    key : 'NodeStudy',
    secret : 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
    resave : false,
    saveUninitialized: true ,
}));


app.use(function(req , res, next) {
    if (req.originalUrl && req.originalUrl.split("/").pop() === 'favicon.ico') {
        return res.sendStatus(204);
    }
    return next();
});

app.use(function(req, res , next) {
    constant.errorMap = {
        "errorCode" : "0000",
        "errorMessage" : "SUCCESS"
    }
    constant.paramMap = {};
    constant.resultMap = {};

    for(let key in req.body) {
        constant.paramMap[key] = req.body[key];
    }

    for(let key in req.query) {
        constant.paramMap[key] = req.query[key]; 
    }
    next();
});


app.use('/main' , main);
app.use('/member' , member);

app.use(function(req,res , next) {

    if(req.headers['content-type'] == 'application/json') {

        returnValue = constant.returnValue;

        returnValue.paramMap = constant.paramMap;
        returnValue.errorMap = constant.errorMap;
        returnValue.resultMap = constant.resultMap;

        console.log(returnValue);

        res.json(returnValue); 
    } else {
        next();
    }
});


app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.use(function(req, res, next) {
    res.status(404).send('Sorry cant find that!');
});


app.listen(port , function(){
    // The way to use;
    console.log(`The app is binding the ${port}`);
});