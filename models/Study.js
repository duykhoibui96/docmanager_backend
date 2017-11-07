var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var StudySchema = new Schema({

    StudyID: {

        type: Number,
        unique: true

    },
    Name: String,
    Content: String,
    StudyEmpl: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    }],
    Time: String,
    Documents: [{

        type: Schema.Types.ObjectId,
        ref: 'Document'

    }],
    Seminar: {
        type: Schema.Types.ObjectId,
        ref: 'Seminar'
    },
    Instructor: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    }]


}, {
    collection: 'study'
});

module.exports = mongoose.model('Study', StudySchema);