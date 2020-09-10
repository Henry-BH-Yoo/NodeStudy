const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');
const session = require('express-session');
const crypto = require('crypto');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const {check, validationResult} = require('express-validator');

var constant = require('./constant');
require('dotenv').config();

// DB Connection
mongoose.connect(process.env.DB_URL , {useNewUrlParser : true , useUnifiedTopology: true});

const memberInfo = mongoose.model('memberInfo', {
    userId : String ,
    userPasswd : String ,
    userFirstName : String ,
    userLastName : String ,
    userCertYn : Boolean ,
    userInfoCreateDate : Date ,
    userInfoModifyDate : Date,
} , 'memberInfo');


router.use(passport.initialize());
router.use(passport.session());



router.get('/login', function(req , res) {
    if(!req.session.user) {
        res.render("login");
    } else {
        res.redirect("/main/index");
    }
});

router.post('/login' , [
    check('userId').notEmpty().withMessage('You must enter the email.').isEmail().withMessage('Email format is invalid.'),
    check('password').notEmpty().withMessage('You must enter the password.')
] , async function(req, res, next) {

    if(req.session.user) {
        // 이미 로그인 되어 있음.
        console.log("이미 로그인 되어 있음");
        res.redirect('/main/index');

    } else {
        let paramMap = constant.paramMap;
        let errorMap = constant.errorMap;
        let resultMap = constant.resultMap;

        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            
            errorMap.errorCode = "1000";
            errorMap.errorMessage = "You must check the parameter.";
            errorMap.errorDetail = errors.array();        

            next();
        } else {
            await memberInfo.findOne({"userId" : paramMap.userId}).then(async data => {
                if(data.userCertYn) {
                    await crypto.pbkdf2(paramMap.password, 'NodeStudy' , 100000 , 64 , 'sha512' , (err,derivedKey) => {
                        let cryptedPasswd = derivedKey.toString('hex');
                        
                        // check password
                        if(data.userPasswd === cryptedPasswd) {
                            resultMap.loginSuccess = true;
                            
                            // Session Create
                            req.session.user = data;
                            req.session.loginVendor = "Local";
                            
                            req.session.save();
                            
                            next();                     
                        } else {
                            errorMap.errorCode = "1003";
                            errorMap.errorMessage = "Check your ID or Password";
                            console.log("Login Fail, Wrong id or Password");
                            next();
                        }

                    });
                } else {

                    errorMap.errorCode = "1001";
                    errorMap.errorMessage = "You have already sign in, but not complete. Please check your e-Mail";

                    console.log("Need Authentication");
                    next();
                }

            });
            
        }
    }
});


router.get('/logout' , function(req,res) {
    req.session.destroy();

    res.redirect('/member/login');
});


router.get('/register' , function(req , res) {
    res.render("register");
});


router.post('/register' , [
    check('firstName').notEmpty().withMessage('You must enter the first name.'),
    check('lastName').notEmpty().withMessage('You must enter the first name.'),
    check('email').notEmpty().withMessage('You must enter the email.').isEmail().withMessage('Email format is invalid.'),
    check('password').notEmpty().withMessage('You must enter the email.').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i").withMessage('Password is over 8 characters and include at least 1 uppercase, 1 lowercase and 1 special case.').custom((value,{req,loc,path})=> {
        if(value !== req.body.rePassword) {
            throw new Error("Password doesn't match");
        } else {
            return value;
        }
    })
    
] , async function(req,res,next) {

    let paramMap = constant.paramMap;
    let errorMap = constant.errorMap;

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        errorMap.errorCode = "1000";
        errorMap.errorMessage = "You must check the parameter.";
        errorMap.errorDetail = errors.array();        
        
        next();
    } else {
        // Check whether exist or not.
        await memberInfo.countDocuments({"userId" : paramMap.email}).then(async data => {
            if(data !== 0 ) { 

                await memberInfo.countDocuments({"userId" : paramMap.email , "userCertYn" : false}).then(async data => {
                    if(data > 0 ) {
                        console.log(">>>> Register, but Not Cert");
                        // Register, but Not Cert
                        errorMap.errorCode = "1001";
                        errorMap.errorMessage = "Already Register, but Not Cert";

                        await memberInfo.findOne({"userId" : paramMap.email}).then(async data => {
                            console.log(data);
                            sendMail(paramMap.email , 'Check Register' , `<a href="${process.env.COMPLETE_REGISTER_URL}${data._id}"> <b> 가입완료 </b>`);
                        })

                    } else {
                        console.log(">>>> Exist Data");
                        // Exist Data
                        errorMap.errorCode = "1002";
                        errorMap.errorMessage = "Already Register";
                    }
                });
            } else {
                // No data // Insert And Sending Mail
                await crypto.pbkdf2(paramMap.password, 'NodeStudy' , 100000 , 64 , 'sha512' , (err,derivedKey) => {
                    let cryptedPasswd = derivedKey.toString('hex');

                    let memberObj = new memberInfo({
                        userId : paramMap.email ,
                        userPasswd : cryptedPasswd ,
                        userFirstName : paramMap.firstName ,
                        userLastName : paramMap.lastName ,
                        userCertYn : false ,
                        userInfoCreateDate : Date.now() ,
                    });
    
                    memberObj.save(function(err, member) {
                        sendMail(paramMap.email , 'Check Register' , `<a href="${process.env.COMPLETE_REGISTER_URL}${member._id}"> <b> 가입완료 </b>`)
                    });
                });

            }

        }).catch(err => {
           console.log(err); 
        });

        next();
    }
});


router.get('/completeRegister/:id' , function(req,res){  
    let query = memberInfo.where({"_id": req.params.id});
    query.updateOne({$set: {userCertYn:true, userInfoModifyDate:Date.now()}}).exec();
    res.redirect("/member/login");
});


router.get('/forgotPassword' , function(req , res) {
    res.render("forgot-password");
});

router.post('/forgotPassword' , async function(req , res , next) {

    let paramMap = constant.paramMap;
    let errorMap = constant.errorMap;

    await memberInfo.countDocuments({"userId" : paramMap.email}).then(async data => {
        if(data > 0 ) { 
            // Send New Password

            var newPassword = Math.random().toString(36).substr(2,11);

            await crypto.pbkdf2(newPassword, 'NodeStudy' , 100000 , 64 , 'sha512' , (err,derivedKey) => {
                let cryptedPasswd = derivedKey.toString('hex');
                let query = memberInfo.where({"userId": paramMap.email});
                query.updateOne({$set: {userPasswd:cryptedPasswd , userInfoModifyDate:Date.now()}}).exec();


                sendMail(paramMap.email , 'Change Password' , `<b> 임시비밀번호는 ${newPassword} 입니다`);

                console.log(newPassword);
            });
    
            next();
        } else {
            errorMap.errorCode = "1004";
            errorMap.errorMessage = "Not registered";
            
            next();
        }
    });
   
});

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENTID,
		clientSecret: process.env.GOOGLE_CLIENTSECRET,
		callbackURL: process.env.GOOGLE_CALLBACKURL,
	}, 
	function(accessToken, refreshToken, profile, cb) {
        return cb(null, profile);
	}
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENTID,
    clientSecret: process.env.FACEBOOK_CLIENTSECRET,
    callbackURL: process.env.FACEBOOK_CALLBACKURL,
    passReqToCallback: true,
  }, function (req, accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
  }
));

router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/callbackGoogle', passport.authenticate('google', { failureRedirect: '/member/login' }), 
		  function(req, res) {

            var data = new Object();
            data.userId = req.user.id;
            data.userFirstName = req.user.name.givenName;
            data.userLastName = req.user.name.familyName
            

            req.session.user = data;
            req.session.loginVendor = "Google";
            
            req.session.save();
            
			res.redirect('/main/index');
});


router.get('/facebook', passport.authenticate('facebook', {
    authType: 'rerequest', scope: ['public_profile', 'email']
}));

router.get('/callbackFacebook', passport.authenticate('facebook', { failureRedirect: '/member/login' }), function(req, res) {

    var data = new Object();
    data.userId = req.user.id;
    data.userFirstName = req.user.displayName;
    data.userLastName = "";
    

    req.session.user = data;
    req.session.loginVendor = "Facebook";
    req.session.save();


    res.redirect('/main/index');
});


async function sendMail(eMail, subject , html) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            type: 'login',
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PW
        }
    });


    await transporter.sendMail({
        from: `"Byounghak Yoo" <${process.env.MAIL_ID}>`,
        to: eMail,
        subject: subject,
        html: html
    }, function(err, res) {
        if(err) {
            console.log(err);
        } else {
            console.log("Mail Sent")
        }
    });
}

module.exports = router;