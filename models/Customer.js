var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Employee = require('./Employee');
var listResponseHandler = require('../helpers/list-reponse-handler');
var errorHandler = require('../helpers/error-handler');

var CustomerSchema = new Schema({

    CustomerID: {

        type: Number,
        unique: true

    },
    Name: String,
    Address: String,
    Phone: String,
    Representative: String,
    ResponsibleEmpl: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    }]


}, {
    collection: 'customer'
});


module.exports = mongoose.model('Customer', CustomerSchema);