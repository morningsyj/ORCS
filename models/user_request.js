var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user_request = new Schema({
    username: String,
    start_time: Date,
    end_time: Date,
    duration: Number, // In milisceconds
    gpu: Number
});

module.export = mongoose.model('user_requests', user_request);