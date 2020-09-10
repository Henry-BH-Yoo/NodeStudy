const express = require('express');
const router = express.Router();

router.get('/index', function(req , res) {
    if(!req.session.user) {
        res.redirect("/member/login");
    } else {

        console.log(req.session.user);

        res.render("main" , {
            user: req.session.user ,
            vendor : req.session.loginVendor
            }
        );
    }
});

module.exports = router;