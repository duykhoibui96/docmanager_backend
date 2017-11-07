var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var EmployeeSchema = new Schema({

    EmplID: {

        type: Number,
        unique: true

    },
    EmplRcd: Number,
    Name: String,
    ChildDepartment: String,
    OfficerCode: String,
    JobTitle: String,
    Mail: {

        type: String,
        unique: true

    }

}, {
    collection: 'employee'
});

EmployeeSchema.statics.checkEmail = function (email, callback) {

    this.findOne({

        Mail: email

    }, callback)

}

// EmployeeSchema.statics.findByCustomer = function (customerID, req, res) {

//     Customer.findOne({

//             CustomerID: customerID

//         })
//         .populate('ResponsibleEmpl')
//         .select('ResponsibleEmpl')
//         .exec((err, doc) => {

//             if (err) {

//                 console.log(err);
//                 res.status(500).json(err);

//             } else if (doc == null)
//                 errorHandler('customer', 'not-found', res);
//             else
//                 listResponseHandler(doc.ResponsibleEmpl, req, res);


//         })

// }

module.exports = mongoose.model('Employee', EmployeeSchema);