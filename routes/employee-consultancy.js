var router = require("express").Router();
var Employee = require("../models/Employee");
var Consultancy = require("../models/Consultancy");
var listResponseHandler = require("../helpers/list-reponse-handler");
var errorHandler = require("../helpers/error-handler");

/************************CONSULTANCY + EMPLOYEE*****************************/
router.get('/consultancy-list/by-employee/:id', (req, res) => {

    let emplID = req.params.id != 'current' ? req.params.id : req.userData.id;

    Employee.findById(emplID).exec((err, employee) => {

        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else if (employee == null)
            errorHandler('employee', 'not-found', res);
        else
            Consultancy.find({

                ConsultingEmpl: employee._id

            }).lean()
            .populate('Customer', 'CustomerID Name')
            .exec((err, docs) => {

                if (err) {
                    console.log(err);
                    res.status(500).json(err);
                } else
                    listResponseHandler(docs, req, res);
                console.log(docs);

            })

    })


})
/*****************************************************/

module.exports = router;