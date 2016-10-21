var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');
var util = require('util');

router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

router.get('/request', function(req, res){
    if (typeof req.user != 'undefined') {
        var exec = require('child_process').exec;
        var cmd = util.format('echo \"sudo ./scripts/grant.sh %s\"', req.user.username);

        exec(cmd, function(err, stdout, stderr) {
            console.log("request: ")
            if (err) {
                console.log(stderr);
            } else {
                console.log(stdout);
            }
        });
    }
    res.redirect('/');
});

router.get('/yield', function(req, res){
    var exec = require('child_process').exec;
    var cmd = 'pwd';

    exec(cmd, function(err, stdout, stderr) {
        console.log("yield: ")
        if (err) {
            console.log(stderr);
        } else {
            console.log(stdout);
        }
    });
    res.redirect('/');
});

module.exports = router;