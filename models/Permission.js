var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PermissionSchema = new Schema({

    Name: String,
    Description: String,
    EmplIDList: [Number]


}, { collection: 'permission' });

module.exports = mongoose.model('Permission', PermissionSchema);