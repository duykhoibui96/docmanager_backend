var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AccountSchema = new Schema({

    EmplID: {

        type: Number,
        unique: true

    },
    Username: String,
    Password: {

        type: String,
        default: '123456'

    }

},{ collection: 'account'});

module.exports = mongoose.model('Account', AccountSchema);