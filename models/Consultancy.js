var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ConsultancySchema = new Schema({

    ConsID: {

        type: Number,
        unique: true

    },
    ConsultingEmpl: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    },
    Customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    },
    Name: String,
    ConsultedPerson: String,
    Content: String,
    Documents: [{

        type: Schema.Types.ObjectId,
        ref: 'Document'

    }],
    Time: Object


}, {
    collection: 'consultancy'
});

module.exports = mongoose.model('Consultancy', ConsultancySchema);