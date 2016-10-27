var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var account = require('../models/account');
var user_request = require('../models/user_request')
var passport = require('passport');
var util = require('util');
var moment = require('moment');

var time_shift = function(original_time, delta_time) {
    return new Date(original_time.getTime() + delta_time);
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

var get_active_users = function(req, res, next) {
    var current_date;
    if (req.query.date === undefined)
    {
        current_date = new moment();
    } else {
        current_date = new moment(req.query.date);
    }
    var ltime = new moment(current_date).startOf('day');
    var rtime = new moment(current_date).endOf('day');
    res.locals.ltime = ltime;
    //console.log(res.locals.ltime);
    console.log('ltime: ' + ltime.toString());
    console.log('rtime: ' + rtime.toString());
    user_request.aggregate(
        [
            {
                '$match': {'start_time': {'$lte': rtime.toDate()},  'end_time': {'$gte': ltime.toDate()}}
            },
            {
                '$sort': {'username': 1}
            }
        ],
        function(err, result) {
            if (err)
            {
                console.log(err);
                res.send(err);
                return ;
            }
            console.log(result);
            res.locals.active_requests = result;
            next();
        }
    );
}

router.get('/query', get_active_users, function(req, res) {
    // console.log(res.locals);
    var result = {};
    for (var j = 0; j < 8; ++j) {
        result[j] = {'gpu': j, 'usage': new Array(24)};
    }

    var ltime = res.locals.ltime;
    var rtime = new moment(ltime);
    rtime.endOf('hour');

    // console.log('n ltime: ' + ltime.toString());
    // console.log('n rtime: ' + rtime.toString());

    for (var j in res.locals.active_requests)
    {
        var item = res.locals.active_requests[j];

        if (result[item.gpu] === undefined)
        {
            result[item.gpu] = {'gpu': item.gpu, 'usage': new Array(24)};
        }
        
        for (var i = 0; i < 24; ++i)
        {
            ltime.hour(i);
            rtime.hour(i);
            // console.log(ltime.toString() + ' ' + rtime.toString());
            if (!(rtime.isBefore(item.start_time) || ltime.isAfter(item.end_time))) {
                result[item.gpu]['usage'][i] = item.username;
                // console.log("Fuck!!!!");
            }
        }
    }
    
    res.render('query', {'user': req.user, 'date': ltime.format('MM-DD-YYYY'), 'result': result});
});

router.get('/request', function(req, res) {
    res.send('unautherized request!');
});

var check_available = function(request, cb) {
    if (!Number.isInteger(request.gpu) || request.gpu < 0 || request.gpu >= 8)
        cb('GPU should be 0 to 7!', request);
    else if (request.duration <= 0)
        cb('start time should be before end time!', request);
    else {
        console.log('check:');
        console.log(request.toString());
        user_request.find({
            'start_time': {'$lte': request.end_time},
            'end_time': {'$gte': request.start_time},
            'gpu': request.gpu
        }, function (err, result) {
            console.log('result:');
            console.log(result);
            if (err)
                console.log(err);
            else {
                if (result.length > 0) {
                    console.log('conflict!');
                    console.log(result.toString());
                    cb('request conflict!', result);
                } else
                    cb('', request);
            }
        });
    }
}

router.post('/request', function(req, res) {
    if (req.user === undefined) {
        res.send("unautherized request!");
    }
    console.log(req.user);
    var username = req.user.username;
    var start_time = new Date(req.body.start_time);
    var duration, end_time;
    if (req.body.duration === undefined) {
        console.log('choice 1!');
        end_time = new Date(req.body.end_time);
        duration = end_time.getTime() - start_time.getTime();
    } else {
        console.log('choice 2!');
        duration = parseInt(req.body.duration) * 3600 * 1000;
        end_time = time_shift(start_time, duration);
    }
    start_time.setMinutes(0, 0, 0);
    end_time.setMinutes(59, 59, 999);
    duration = end_time.getTime() - start_time.getTime();
    var gpu = parseInt(req.body.gpu);
    var request = new user_request({ 
        'username': username, 
        'start_time': start_time, 
        'end_time': end_time, 
        'duration': duration, 
        'gpu': gpu 
    });
    check_available(request, function(err, request) {
        if (err)
        {
            res.send('error', err);
            return ;
        }
        request.save(function(err, request) {
            if (err) {
                console.log(request.toString());
                return res.send(err);
            }
            res.send('request success!\nwait for 10 seconds and you will be able to access the server!')
        });
    });
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

router.get('/unlock', function(req, res){
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