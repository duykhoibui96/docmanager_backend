var router = require("express").Router();
var Employee = require("../models/Employee");
var Customer = require("../models/Customer");
var listResponseHandler = require("../helpers/list-reponse-handler");
var errorHandler = require("../helpers/error-handler");

/************************EMPLOYEE + CUSTOMER*****************************/
router.get('/employee-list/by-customer/:id', (req, res) => {

    let customerID = req.params.id;

    Customer.findById(customerID)
        .select('ResponsibleEmpl')
        .populate('ResponsibleEmpl')
        .exec((err, customer) => {

            if (err) {

                console.log(err);
                res.status(500).json(err);

            } else if (customer == null) {

                errorHandler('customer', 'not-found', res);

            } else
                listResponseHandler(customer.ResponsibleEmpl, req, res);

        })


})
router.get('/customer-list/by-employee/:id', (req, res) => {

    let emplID = req.params.id != 'current' ? req.params.id : req.userData.id;

    Employee.findById(emplID).exec((err, employee) => {

        if (err) {

            console.log(err);
            res.status(500).json(err);

        } else if (employee == null) {

            errorHandler('employee', 'not-found', res);

        } else
            Customer.find({

                'ResponsibleEmpl': employee._id

            }).lean().select('CustomerID Name').exec((err, docs) => {

                if (err) {

                    console.log(err);
                    res.status(500).json(err);

                } else
                    listResponseHandler(docs, req, res);


            });

    })


})
router.post('/combine', (req, res) => {

    let emplID = req.body.emplID ? req.body.emplID : req.userData.id;
    let customerID = req.body.customerID;

    console.log(req.body);

    Employee.findById(emplID).exec((err, employee) => {

        if (err) {

            console.log(err);
            res.status(500).json(err);

        } else if (employee == null) {

            console.log("Not found employee");
            errorHandler('employee', 'not-found', res);

        } else
            Customer.findById(customerID).exec((err, customer) => {

                if (err) {

                    console.log(err);
                    res.status(500).json(err);

                } else if (customer == null) {

                    console.log("Not found customer");
                    errorHandler('customer', 'not-found', res);

                } else {

                    customer.ResponsibleEmpl.push(employee);
                    customer.save((err, doc) => {

                        if (err) {

                            console.log(err);
                            res.status(500).json(err);

                        } else
                            res.json(doc);


                    })

                }



            })

    })


})
router.post('/divide', (req, res) => {

    let emplID = req.body.emplID ? req.body.emplID : req.userData.id;
    let customerID = req.body.customerID;

    console.log(emplID);
    Employee.findById(emplID).exec((err, employee) => {

        if (err) {

            console.log(err);
            res.status(500).json(err);

        } else if (employee == null) {

            errorHandler('employee', 'not-found', res);

        } else
            Customer.findById(customerID).exec((err, customer) => {

                if (err) {

                    console.log(err);
                    res.status(500).json(err);

                } else if (customer == null) {

                    errorHandler('customer', 'not-found', res);

                } else {

                    let index = customer.ResponsibleEmpl.indexOf(employee._id)
                    if (index >= 0)
                        customer.ResponsibleEmpl.splice(index, 1);
                    customer.save((err, doc) => {

                        if (err) {

                            console.log(err);
                            res.status(500).json(err);

                        } else
                            res.json(doc);


                    })

                }



            })

    })

})
/*****************************************************/

module.exports = router;