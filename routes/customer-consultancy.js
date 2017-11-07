var router = require("express").Router();
var Consultancy = require("../models/Consultancy");
var Customer = require("../models/Customer");
var listResponseHandler = require("../helpers/list-reponse-handler");
var errorHandler = require("../helpers/error-handler");

/************************CONSULTANCY + CUSTOMER*****************************/
router.get('/consultancy-list/by-customer/:id', (req, res) => {

    let customerID = req.params.id;

    Customer
        .findById(customerID)
        .exec((err, customer) => {

            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else if (customer == null)
                errorHandler('customer', 'not-found', res);
            else
                Consultancy.find({

                    Customer: customer._id

                })
                .populate('ConsultingEmpl', 'EmplID Name')
                .lean()
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