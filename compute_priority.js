var user_request = require('./models/user_request');
var moment = require('moment');

var compute_priority = function(cb) {
    console.log('check priority:');
    console.log(moment().startOf('week').subtract(4, 'week').toString());
    console.log(moment().endOf('week').toString());
    user_request.find(
        {
       //     'start_time:': {'$gte': moment().startOf('week').subtract(4, 'week').toDate()}, 
        //    'end_time': {'$lte': moment().endOf('week').toDate()}
        }, function(err, result) {
            if (err) {
                console.log(err);
                cb(err, null);
            } else {
                console.log('priority result:');
                console.log(result);
                var ret = {};
                for (i in result) {
                    var item = result[i];
                    if (ret[item.username] === undefined)
                        ret[item.username] = 0;
                    var delta = moment(item.end_time).weeksInYear() - moment().weeksInYear();
                    ret[item.username] += item.duration / (3600 * 1000) * Math.pow(2, delta);
                    console.log('%s: %d %d - %d', item.username, item.duration / (3600 * 1000), delta, item.duration / (3600 * 1000) * Math.pow(2, delta))
                }
                var sorted = [];
                for (i in ret) {
                    sorted.push([i, ret[i]]);
                }
                sorted.sort(function(x, y) {
                    return x[1] - y[1];
                });
                cb('', sorted);
            }
        }
    );
}

module.exports = compute_priority;