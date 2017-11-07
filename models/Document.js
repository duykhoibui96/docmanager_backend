var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var DocumentSchema = new Schema({

    data: Schema.Types.Mixed,
    Time: {
        type: Date,
        default: Date.now
    },
    accessCount: {
        type: Number,
        default: 0
    },
    downloadCount: {
        type: Number,
        default: 0
    },

}, {
    collection: 'document'
});

module.exports = mongoose.model('Document', DocumentSchema);