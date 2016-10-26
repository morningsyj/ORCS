var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var account = mongoose.model('user');
var user_request = mongoose.model('user_request');
var passport = require('passport');
var util = require('util');


var time_shift = function(time_oringinal, time_delta) {
    return new Date(time_oringinal.getTime() + time_delta);
}

router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    account.register(new account({ username : req.body.username }), req.body.password, function(err, account) {
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

router.get('/request', function(req, res) {
    res.render('request');
});

router.post('/request', function(req, res) {
    if (req.user === undefined) {
        res.send("unautherized request!");
    }
    var start_time = new Date(req.body.start_time);
    var duration = parseInt(req.body.duration) * 3600;
    var end_time = time_shift(start_time, duration);
    var gpu = parseInt(req.body.gpu);
    var request = new user_request({ 
        username: req.user, 
        start_time: start_time, 
        end_time: end_time, 
        duration: duration, 
        gpu: gpu 
    });
    request.save(function(err, request) {
        if (err) {
            console.log(err);
            return res.send("Error creating request:\n" + request.toString());
        }
        res.redirect('/');
    });
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

router.get('/request', function(req, res){
    console.log(req.user);
    if (req.user !== undefined) {
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