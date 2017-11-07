var express = require('express');
var jwt = require('jsonwebtoken');
var secretKey = require('../config/secret-key.json').key;
var Account = require('../models/Account');
var Employee = require('../models/Employee');
var Customer = require('../models/Customer');
var Consultancy = require('../models/Consultancy');
var Study = require('../models/Study');
var Seminar = require('../models/Seminar');
var Document = require('../models/Document');
var formatListResult = require('../helpers/list-reponse-handler');
var documentApi = require('./document-api');
var search = require('../helpers/search');
var errorHandler = require('../helpers/error-handler');
var employeeCustomerRoute = require('./employee-customer');
var employeeConsultancyRoute = require('./employee-consultancy');
var employeeStudyRoute = require('./employee-study');
var employeeSeminarRoute = require('./employee-seminar');
var customerConsultancyRoute = require('./customer-consultancy');

var router = express.Router();

router.use((req, res, next) => {

    let method = req.method;
    let path = req.originalUrl;
    let token = req.headers['token'];

    if (method === 'OPTIONS')
        res.send();
    else if (path.includes('authentication') || path.includes('documents') || path.includes('test'))
        next();
    else {
        if (!token)
            res.status(401).json();
        else
            jwt.verify(token, secretKey, (err, decoded) => {

                if (err) {
                    console.log(err);
                    res.status(401).json();
                } else {
                    req.userData = decoded;
                    next();
                }

            })
    }


})

router.use('/documents/uploading', documentApi);
router.use('/employee-customer', employeeCustomerRoute);
router.use('/employee-consultancy', employeeConsultancyRoute);
router.use('/employee-study', employeeStudyRoute);
router.use('/employee-seminar', employeeSeminarRoute);
router.use('/customer-consultancy', customerConsultancyRoute);

router.route('/documents/by-consultancy/:id')
    .get((req, res) => {

        Consultancy
            .findById(req.params.id)
            .populate('Documents')
            .exec((err, doc) => {

                if (err) {

                    console.log(err);
                    res.status(500).send(err);

                } else if (doc == null) errorHandler('consultancy', 'not-found', res);
                else {

                    formatListResult(doc.Documents, req, res);


                }

            })


    })
    .put((req, res) => {

        let documentID = req.body.documentID;
        let type = req.body.type;

        if (type === 'add')
            Consultancy.findByIdAndUpdate(req.params.id, {

                $push: {
                    Documents: documentID
                }

            }).exec((err, doc) => {

                if (err) {

                    console.log(err);
                    res.status(500).send(err);

                } else if (doc == null) errorHandler('consultancy', 'not-found', res);
                else {

                    res.json(doc)


                }

            })
        else
            Consultancy.findByIdAndUpdate(req.params.id, {

                $pull: {
                    Documents: documentID
                }

            }).exec((err, doc) => {

                if (err) {

                    console.log(err);
                    res.status(500).send(err);

                } else if (doc == null) errorHandler('consultancy', 'not-found', res);
                else {

                    res.json(doc)


                }

            })

    })

router.route('/documents/by-study/:id')
    .get((req, res) => {

        Study
            .findById(req.params.id)
            .populate('Documents')
            .exec((err, doc) => {

                if (err) {

                    console.log(err);
                    res.status(500).send(err);

                } else if (doc == null) errorHandler('study', 'not-found', res);
                else {

                    formatListResult(doc.Documents, req, res);


                }

            })



    })
    .put((req, res) => {

        let documentID = req.body.documentID;
        let type = req.body.type;

        if (type === 'add')
            Study.findByIdAndUpdate(req.params.id, {

                $push: {
                    Documents: documentID
                }

            }).exec((err, doc) => {

                if (err) {

                    console.log(err);
                    res.status(500).send(err);

                } else if (doc == null) errorHandler('study', 'not-found', res);
                else {

                    res.json(doc)


                }

            })
        else
            Study.findByIdAndUpdate(req.params.id, {

                $pull: {
                    Documents: documentID
                }

            }).exec((err, doc) => {

                if (err) {

                    console.log(err);
                    res.status(500).send(err);

                } else if (doc == null) errorHandler('study', 'not-found', res);
                else {

                    res.json(doc)


                }

            })

    })

router.put('/accounts/:EmplID', (req, res) => {

    let EmplID = req.params.EmplID;

    Account.findOneAndUpdate({

        EmplID: EmplID

    }, req.body).exec((err, doc) => {

        if (err) {

            console.log(err);
            res.status(500).send(err);

        } else if (doc == null)
            errorHandler('account', 'not-found', res);
        else
            res.json(doc);

    })

})

router.post('/employees/email-check', (req, res) => {

    Employee.findOne(req.body)
        .exec((err, doc) => {

            if (err) {

                console.log(err);
                res.status(500).send(err);

            } else if (doc == null)
                res.send('valid')
            else
                res.status(409).send('invalid');

        })

})

router.post('/accounts/authentication', (req, res) => {

    let data = req.body;

    Account.findOne(data).lean().exec((err, doc) => {

        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else if (doc === null) {
            res.status(406).json({

                instance: 'account',
                type: 'not-correct'

            });
        } else
            Employee.findOne({

                EmplID: doc.EmplID

            }).exec((err, employee) => {

                if (err) {

                    console.log(err);
                    res.status(500).send(err);

                } else {

                    let payload = {

                        id: employee._id

                    }
                    let role = data.Username === 'huynq1' ? 'admin' : 'user';
                    payload.role = role;
                    let token = jwt.sign(payload, secretKey);
                    res.json({

                        token: token,
                        role: role

                    });

                }


            })



    })

})

router.get('/:collection/fetch', (req, res) => {

    let key = req.query.searchText;
    let Model = null;
    switch (req.params.collection) {

        case 'employees':
            Model = Employee;
            break;
        case 'consultancies':
            Model = Consultancy;
            break;
        case 'studies':
            Model = Study;
            break;
        case 'seminars':
            Model = Seminar;
            break;
        case 'customers':
            Model = Customer;
            break;
        case 'documents':
            Document
                .find({
                    'data.originalname': {
                        "$regex": key,
                        "$options": "i"
                    }
                })
                .exec((err, docs) => err ? res.status(500).send(err) : res.json(docs))
            return;

    }

    if (Model !== Document) {

        Model
            .find({
                'Name': {
                    "$regex": key,
                    "$options": "i"
                }
            })
            .select('Name')
            .exec((err, docs) => err ? res.status(500).send(err) : res.json(docs))

    }


})

router.get('/employees/current/info', (req, res) => {

    let id = req.userData.id;

    console.log(id);
    Employee
        .findById(id)
        .exec((err, doc) => {

            if (err) {

                console.log(err);
                res.status(500).send(err);
            } else if (doc == null) {

                console.log('Not found');
                errorHandler('employee', 'not-found', res);

            } else res.json(doc);

        })

})

router.route('/:collection')
    .get((req, res) => {

        let paramsCount = Object.keys(req.query).length;
        console.log(paramsCount);
        if (paramsCount > 2) {

            search(req, res);

        } else {

            new Promise((resolve, reject) => {

                    switch (req.params.collection) {

                        case 'employees':
                            Employee.find((err, docs) => err ? reject(err) : resolve(docs))
                            break;
                        case 'consultancies':
                            Consultancy
                                .find()
                                .populate('ConsultingEmpl', 'Name')
                                .populate('Customer', 'Name')
                                .exec((err, docs) => err ? reject(err) : resolve(docs))
                            break;
                        case 'studies':
                            Study
                                .find()
                                .populate('Seminar', 'Name')
                                .exec((err, docs) => err ? reject(err) : resolve(docs))
                            break;
                        case 'seminars':
                            Seminar
                                .find()
                                .populate('SharingEmpl', 'Name')
                                .exec((err, docs) => err ? reject(err) : resolve(docs))
                            break;
                        case 'customers':
                            Customer.find((err, docs) => err ? reject(err) : resolve(docs))
                            break;
                        case 'documents':
                            Document.find((err, docs) => err ? reject(err) : resolve(docs))
                            break;

                    }

                })
                .then(list => formatListResult(list, req, res))
                .catch(err => res.status(500).send(err))

        }

    })
    .post((req, res) => new Promise((resolve, reject) => {

            let data = req.body;
            let Model = null;
            switch (req.params.collection) {

                case 'employees':
                    Model = Employee;
                    break;
                case 'consultancies':
                    Model = Consultancy;
                    break;
                case 'studies':
                    Model = Study;
                    break;
                case 'seminars':
                    Model = Seminar;
                    break;
                case 'customers':
                    Model = Customer;
                    break;
                case 'documents':
                    Model = Document;
                    break;

            }

            console.log(data);
            Model.create(data, (err) => err ? reject(err) : resolve('ok'));

        })
        .then(record => res.json(record))
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        })
    )

router.route('/:collection/:id')
    .get((req, res) =>

        new Promise((resolve, reject) => {

            let id = req.params.id;

            switch (req.params.collection) {

                case 'employees':
                    Employee.findById(id, (err, doc) => err ? reject(err) : resolve(doc))
                    break;
                case 'consultancies':
                    Consultancy
                        .findById(id)
                        .populate("ConsultingEmpl", "Name")
                        .populate("Customer", "Name")
                        .exec((err, doc) => err ? reject(err) : resolve(doc))
                    break;
                case 'studies':
                    Study
                        .findById(id)
                        .populate("StudyEmpl", "Name")
                        .populate("Instructor", "Name")
                        .populate("Seminar", "Name")
                        .exec((err, doc) => err ? reject(err) : resolve(doc))
                    break;
                case 'seminars':
                    Seminar.findById(id)
                        .populate("SharingEmpl", "Name")
                        .exec((err, doc) => err ? reject(err) : resolve(doc))
                    break;
                case 'customers':
                    Customer.findById(id)
                        .populate("ResponsibleEmpl", "Name")
                        .exec((err, doc) => err ? reject(err) : resolve(doc))
                    break;
                case 'documents':
                    Document.findById(id)
                        .exec((err, doc) => err ? reject(err) : resolve(doc))
                    break;

            }

        })
        .then(record => res.json(record))
        .catch(err => res.status(500).send(err))

    )
    .put((req, res) =>

        new Promise((resolve, reject) => {

            let id = req.params.id;

            let Model = null;
            switch (req.params.collection) {

                case 'employees':
                    Model = Employee;
                    break;
                case 'consultancies':
                    Model = Consultancy;
                    break;
                case 'studies':
                    Model = Study;
                    break;
                case 'seminars':
                    Model = Seminar;
                    break;
                case 'customers':
                    Model = Customer;
                    break;
                case 'documents':
                    Model = Document;
                    break;

            }

            Model.findByIdAndUpdate(id, req.body, (err, doc) => err ? reject(err) : resolve(doc))

        })
        .then(deletedRecord => res.json(deletedRecord))
        .catch(err => res.status(500).send(err))

    )
    .delete((req, res) =>
        new Promise((resolve, reject) => {

            let id = req.params.id;

            let Model = null;
            switch (req.params.collection) {

                case 'employees':
                    Model = Employee;
                    break;
                case 'consultancies':
                    Model = Consultancy;
                    break;
                case 'studies':
                    Model = Study;
                    break;
                case 'seminars':
                    Model = Seminar;
                    break;
                case 'customers':
                    Model = Customer;
                    break;
                case 'documents':
                    Model = Document;
                    break;

            }

            Model.findByIdAndRemove(id, (err, doc) => err ? reject(err) : resolve(doc))

        })
        .then(deletedRecord => res.json(deletedRecord))
        .catch(err => res.status(500).send(err))

    )

module.exports = router;