var router = require("express").Router();
var Employee = require("../models/Employee");
var Seminar = require("../models/Seminar");
var listResponseHandler = require("../helpers/list-reponse-handler");
var errorHandler = require("../helpers/error-handler");

/************************SEMINAR + EMPLOYEE*****************************/
router.get('/seminar-list/by-employee/:id', (req, res) => {

    let emplID = req.params.id != 'current' ? req.params.id : req.userData.id;

    Employee.findById(emplID).exec((err, employee) => {

        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else if (employee == null)
            errorHandler('employee', 'not-found', res);
        else
            Seminar.find({

                SharingEmpl: emplID

            })
            .exec((err, docs) => {

                if (err) {
                    console.log(err);
                    res.status(500).json(err);
                } else
                    listResponseHandler(docs, req, res);

            })

    })


})
/*****************************************************/

module.exports = router;