var mongoose = require('mongoose');
var account = require('./models/account');
var user_request = require('./models/user_request');
var util = require('util');

var change_lock = function(user, todo) {
    if (user === 'yeji')
        return ;
    var exec = require('child_process').exec;
    // var cmd = util.format('echo \"sudo ./scripts/%s.sh %s\"', todo, user);
    var cmd = util.format('sudo ./scripts/%s.sh %s', todo, user);

    console.log('execute command: %s', cmd);

    exec(cmd, function(err, stdout, stderr) {
        if (err) {
            console.log(stderr);
        } else {
            console.log(stdout);
        }
    });
}

var check_lock = function(user) {
    if (user === undefined) {
        account.find({}, {'username': 1}, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                for (i in result)
                    check_lock(result[i].username);
            }
        });
    } else {
        console.log('try username:');
        console.log(user);
        user_request.find({'username': user, 'start_time': {'$lte': new Date()}, 'end_time': {'$gte': new Date()}}, function(err, result) {
            console.log('result username:');
            console.log(user);
            if (err) {
                console.log(err)
            } else {
                if (result.length > 0)
                {
                    console.log('success!');
                    change_lock(user, 'login');
                } else {
                    console.log('fail!');
                    change_lock(user, 'logout');
                }
            }
        })
    }
}


module.exports = check_lock;