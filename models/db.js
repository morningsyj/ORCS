var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user_request = new Schema({
    username: String,
    start_time: Date,
    end_time: Date,
    duration: Number, // In milisceconds
    gpu: Number
});

mongoose.model('user_request', user_request);
mongoose.connect('mongodb://localhost/orcs_db');