var express = require('express');
var jwt = require('jsonwebtoken');
var multer = require('multer');
var secretKey = require('../config/secret-key.json').key;
var Account = require('../models/Account');
var Employee = require('../models/Employee');
var Customer = require('../models/Customer');
var Consultancy = require('../models/Consultancy');
var Study = require('../models/Study');
var Seminar = require('../models/Seminar');
var Document = require('../models/Document');
var RESTFUL = require('../helpers/restful-api');
var listResponseHandler = require('../helpers/list-reponse-handler');
var errorHandler = require('../helpers/error-handler');
var documentApi = require('./document-api');

var router = express.Router();

var storage = multer.diskStorage({
    destination: './files/',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

var upload = multer({
    storage: storage
}).any(); // multer configuration

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

router.use('/documents', documentApi);

/************************ACCOUNT*****************************/
router.put('/accounts/:emplID', (req, res) => {

    let EmplID = req.params.emplID;
    let data = req.body;

    Account.findOneAndUpdate({

            EmplID: EmplID

        }, data)
        .exec((err, doc) => {

            if (err) {

                console.log(err);
                res.status(500).json(err);

            } else if (doc == null)
                errorHandler('account', 'not-found', res);
            else
                res.json(doc);

        })

})
router.post('/accounts/authentication', (req, res) => {

    let data = req.body;

    Account.findOne(data).lean().select('EmplID').exec((err, doc) => {

        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else if (doc === null) {
            res.status(406).json({

                instance: 'account',
                type: 'not-correct'

            });
        } else {
            let payload = Object.assign({}, doc);
            let role = data.Username === 'huynq1' ? 'admin' : 'user';
            let token = jwt.sign(payload, secretKey);
            res.json({

                token: token,
                role: role

            });
        }


    })


})
/*****************************************************/

/************************EMPLOYEE*****************************/
var employeeModel = new RESTFUL(Employee, 'EmplID');
router.get('/employees/fetch', employeeModel.fetch);
router.get('/employees/by-id/:id', employeeModel.getById);
router.get('/employees', employeeModel.list);
router.get('/employees/:id', employeeModel.get);
router.post('/employees', employeeModel.create);
router.put('/employees/:id', employeeModel.update);
// router.put('/employees/:id', (req,res) => errorHandler('employee','not-found',res));
router.delete('/employees/:id', employeeModel.delete);
router.post('/employees/email-check', (req, res) => {

    Employee.checkEmail(req.body.Mail, (err, doc) => {

        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else if (doc == null)
            res.json({
                status: 'valid'
            });
        else
            errorHandler('email', 'existed', res);

    })

});
router.get('/employees/current/info', (req, res) => {

    console.log(req.userData);
    let idObject = {

        EmplID: req.userData.EmplID

    }

    Employee.findOne(idObject, (err, doc) => {

        if (err) {
            console.log(err);
            res.status(500).json();
        } else if (doc == null)
            errorHandler('employee', 'not-found', res);
        else
            res.json(doc);


    })

})
router.post('/employees/search', (req, res) => {

    let searchParams = req.body;
    if (searchParams.keyWord)
        searchParams.keyWord = searchParams.keyWord.toLowerCase();
    let employeeListPromise = new Promise((resolve, reject) => {

        if (searchParams.mode === 'all')
            Employee.find().exec((err, customerList) => {

                if (err) {

                    console.log(err);
                    reject(err);

                } else
                    resolve(customerList);


            })
        else
            Consultancy
            .find({

                ConsultingEmpl: {
                    $ne: null
                }

            })
            .select('ConsultingEmpl')
            .exec((err, consultancyList) => {

                if (err) {

                    console.log(err);
                    reject(err);

                } else {

                    console.log(consultancyList);
                    let consultingEmpl = consultancyList.map(item => item.ConsultingEmpl);
                    let searchObj = searchParams.mode === 'consulted' ? {

                        $in: consultingEmpl

                    } : {

                        $nin: consultingEmpl
                    }

                    Employee
                        .find({

                            _id: searchObj

                        })
                        .exec((err, customerList) => {

                            if (err) {

                                console.log(err);
                                reject(err);

                            } else
                                resolve(customerList);

                        })

                }



            })


    })

    employeeListPromise
        .then(list => {

            let resultList = !searchParams.keyWord ? list :
                list.filter(item => {

                    return item.Name.toLowerCase().includes(searchParams.keyWord) ||
                        (item.OfficerCode ? item.OfficerCode.toLowerCase().includes(searchParams.keyWord) : false) ||
                        (item.ChildDepartment ? item.ChildDepartment.toLowerCase().includes(searchParams.keyWord) : false) ||
                        (item.JobTitle ? item.JobTitle.toLowerCase().includes(searchParams.keyWord) : false)

                })

            listResponseHandler(resultList, req, res);

        })
        .catch(err => res.status(500).json(err))



});
/*****************************************************/


/************************CUSTOMER*****************************/
var customerModel = new RESTFUL(Customer, 'CustomerID');
router.get('/customers/fetch', customerModel.fetch);
router.get('/customers', customerModel.list);
router.get('/customers/:id', customerModel.get);
router.post('/customers', customerModel.create);
router.put('/customers/:id', customerModel.update);
router.delete('/customers/:id', customerModel.delete);
router.post('/customers/search', (req, res) => {

    let searchParams = req.body;
    if (searchParams.keyWord)
        searchParams.keyWord = searchParams.keyWord.toLowerCase();
    let customerListPromise = new Promise((resolve, reject) => {

        if (searchParams.mode === 'all')
            Customer.find().exec((err, customerList) => {

                if (err) {

                    console.log(err);
                    reject(err);

                } else
                    resolve(customerList);


            })
        else
            Consultancy
            .find({

                Customer: {
                    $ne: null
                }

            })
            .select('Customer')
            .exec((err, consultancyList) => {

                if (err) {

                    console.log(err);
                    reject(err);

                } else {

                    let consultedEmpl = consultancyList.map(item => item.Customer);
                    let searchObj = searchParams.mode === 'consulted' ? {

                        $in: consultedEmpl

                    } : {

                        $nin: consultedEmpl
                    }

                    Customer
                        .find({

                            _id: searchObj

                        })
                        .exec((err, customerList) => {

                            if (err) {

                                console.log(err);
                                reject(err);

                            } else
                                resolve(customerList);

                        })

                }



            })


    })

    customerListPromise
        .then(list => {

            let resultList = !searchParams.keyWord ? list :
                list.filter(item => {

                    return item.Name.toLowerCase().includes(searchParams.keyWord) ||
                        (item.Address ? item.Address.toLowerCase().includes(searchParams.keyWord) : false) ||
                        (item.Phone ? item.Phone.toLowerCase().includes(searchParams.keyWord) : false) ||
                        (item.Representative ? item.Representative.toLowerCase().includes(searchParams.keyWord) : false)

                })

            listResponseHandler(resultList, req, res);

        })
        .catch(err => res.status(500).json(err))



});

/*****************************************************/

/************************SEMINAR*****************************/
var seminarModel = new RESTFUL(Seminar, 'SeminarID');
router.get('/seminars/fetch', seminarModel.fetch);
router.get('/seminars', seminarModel.list);
router.get('/seminars/:id', seminarModel.get);
router.post('/seminars', seminarModel.create);
router.put('/seminars/:id', seminarModel.update);
router.delete('/seminars/:id', seminarModel.delete);
router.post('/seminars/search', (req, res) => {

    let searchParams = req.body;
    if (searchParams.keyWord)
        searchParams.keyWord = searchParams.keyWord.toLowerCase();
    console.log(searchParams);
    Seminar
        .find()
        .populate('SharingEmpl', 'EmplID Name')
        .lean()
        .exec((err, docs) => {

            if (err) {
                console.log(err);
                res.status(500).json(err);

            } else {

                let list = docs;
                let startDate = null;
                let endDate = null;
                if (searchParams.timeMode === 'depends') {
                    let startDateString = searchParams.startDate;
                    let endDateString = searchParams.endDate;
                    if (startDateString)
                        startDate = new Date(Number(startDateString));
                    if (endDateString)
                        endDate = new Date(Number(endDateString));
                } else if (searchParams.timeMode && searchParams.timeMode.includes('days-recent')) {

                    let numberOfDays = Number(searchParams.timeMode.split('-')[0]);
                    endDate = new Date();
                    startDate = new Date();
                    startDate.setDate(endDate.getDate() - numberOfDays);

                }

                if (startDate || endDate || searchParams.keyWord || searchParams.collectionRecord)
                    list = docs.filter(item => {

                        let valid = true;
                        let date = new Date(item.Time);
                        if (startDate)
                            valid = valid && startDate <= date;
                        if (endDate)
                            valid = valid && endDate >= date;
                        if (searchParams.collectionRecord)
                            valid = valid && searchParams.collectionRecord === item.SharingEmpl._id.toString();

                        return valid && (searchParams.keyWord ? (

                            item.Name.toLowerCase().includes(searchParams.keyWord) ||
                            (item.Content ? item.Content.toLowerCase().includes(searchParams.keyWord) : false) ||
                            (item.OrganizationalUnit ? item.OrganizationalUnit.toLowerCase().includes(searchParams.keyWord) : false)

                        ) : true);

                    })

                listResponseHandler(list, req, res);


            }


        })


})
/*****************************************************/

/************************CONSULTANCY*****************************/
var consultancyModel = new RESTFUL(Consultancy, 'ConsID');
router.get('/consultancies/fetch', consultancyModel.fetch);
router.get('/consultancies/by-id/:id', consultancyModel.getById);
router.get('/consultancies', consultancyModel.list);
router.get('/consultancies/:id', consultancyModel.get);
router.post('/consultancies', consultancyModel.create);
router.put('/consultancies/:id', consultancyModel.update);
router.delete('/consultancies/:id', consultancyModel.delete);
router.post('/consultancies/search', (req, res) => {

    let searchParams = req.body;
    if (searchParams.keyWord)
        searchParams.keyWord = searchParams.keyWord.toLowerCase();
    let startDate = null;
    let endDate = null;
    if (searchParams.timeMode === 'depends') {
        let startDateString = searchParams.startDate;
        let endDateString = searchParams.endDate;
        if (startDateString)
            startDate = new Date(Number(startDateString));
        if (endDateString)
            endDate = new Date(Number(endDateString));
    } else if (searchParams.timeMode && searchParams.timeMode.includes('days-recent')) {

        let numberOfDays = Number(searchParams.timeMode.split('-')[0]);
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - numberOfDays);

    }

    Consultancy
        .find()
        .lean()
        .exec((err, docs) => {

            if (err) {

                console.log(err);
                res.status(500).json(err);

            } else if (docs.length === 0)
                errorHandler('consultancy', 'not-found', res);
            else {

                let list = searchParams.timeMode === 'all' ? docs : docs.filter(item => {

                    if (!startDate && !endDate)
                        return true;

                    let valid = true;
                    let time = new Date(item.Time);

                    if (startDate)
                        valid = valid && time >= startDate;
                    if (endDate)
                        valid = valid && time <= endDate;
                    if (searchParams.keyWord)
                        valid = valid && (

                            item.Name.toLowerCase().includes(searchParams.keyWord) ||
                            (item.Content ? item.Content.toLowerCase().includes(searchParams.keyWord) : false)
                        )

                    return valid;

                })

                listResponseHandler(list, req, res);

            }


        })

})
/*****************************************************/

/************************STUDY*****************************/
var studyModel = new RESTFUL(Study, 'StudyID');
router.get('/studies/fetch', studyModel.fetch);
router.get('/studies/by-id/:id', studyModel.getById);
router.get('/studies', studyModel.list);
router.get('/studies/:id', studyModel.get);
router.post('/studies', studyModel.create);
router.put('/studies/:id', studyModel.update);
router.delete('/studies/:id', studyModel.delete);
router.post('/studies/search', (req, res) => {

    let searchParams = req.body;
    if (searchParams.keyWord)
        searchParams.keyWord = searchParams.keyWord.toLowerCase();
    console.log(searchParams);
    let startDate = null;
    let endDate = null;
    if (searchParams.timeMode === 'depends') {
        let startDateString = searchParams.startDate;
        let endDateString = searchParams.endDate;
        if (startDateString)
            startDate = new Date(Number(startDateString));
        if (endDateString)
            endDate = new Date(Number(endDateString));
    } else if (searchParams.timeMode && searchParams.timeMode.includes('days-recent')) {

        let numberOfDays = Number(searchParams.timeMode.split('-')[0]);
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - numberOfDays);

    }
    Study
        .find()
        .lean()
        .exec((err, docs) => {

            if (err) {

                console.log(err);
                res.status(500).json(err);

            } else if (docs.length === 0)
                errorHandler('study', 'not-found', res);
            else {

                let list = searchParams.timeMode === 'all' ? docs : docs.filter(item => {

                    if (!startDate && !endDate)
                        return true;

                    let valid = true;
                    let time = new Date(item.Time);

                    if (startDate)
                        valid = valid && time >= startDate;
                    if (endDate)
                        valid = valid && time <= endDate;
                    if (searchParams.keyWord)
                        valid = valid && (

                            item.Name.toLowerCase().includes(searchParams.keyWord) ||
                            (item.Content ? item.Content.toLowerCase().includes(searchParams.keyWord) : false)
                        )

                    return valid;

                })

                console.log(list);
                listResponseHandler(list, req, res);

            }


        })

})
/*****************************************************/


/************************EMPLOYEE + CUSTOMER*****************************/
router.get('/employee-customer/employee-list/by-customer/:id', (req, res) => {

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
router.get('/employee-customer/customer-list/by-employee/:id', (req, res) => {

    let emplID = req.params.id;

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
router.post('/employee-customer/combine', (req, res) => {

    let emplID = req.body.emplID;
    let customerID = req.body.customerID;

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
router.post('/employee-customer/divide', (req, res) => {

    let emplID = req.body.emplID;
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

/************************CONSULTANCY + CUSTOMER*****************************/
router.get('/customer-consultancy/consultancy-list/by-customer/:id', (req, res) => {

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


/************************CONSULTANCY + EMPLOYEE*****************************/
router.get('/employee-consultancy/consultancy-list/by-employee/:id', (req, res) => {

    let emplID = req.params.id;

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
            .populate('Customer','CustomerID Name')
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

/************************STUDY + EMPLOYEE*****************************/
router.get('/employee-study/study-list/by-employee/:id', (req, res) => {

    let emplID = req.params.id;

    Employee.findById(emplID).exec((err, employee) => {

        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else if (employee == null)
            errorHandler('employee', 'not-found', res);
        else
            Study.find({

                StudyEmpl: {
                    $in: [emplID]
                }

            })
            .populate('Seminar','SeminarID Name')
            .exec((err, docs) => {

                if (err) {
                    console.log(err);
                    res.status(500).json(err);
                } else
                    listResponseHandler(docs, req, res);

            })

    })


})

router.get('/employee-study/instruction-list/by-employee/:id', (req, res) => {

    let emplID = req.params.id;

    Employee.findById(emplID).exec((err, employee) => {

        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else if (employee == null)
            errorHandler('employee', 'not-found', res);
        else
            Study.find({

                Instructor: {
                    $in: [emplID]
                }

            })
            .populate('Seminar','SeminarID Name')
            .exec((err, docs) => {

                if (err) {
                    console.log(err);
                    res.status(500).json(err);
                } else
                    listResponseHandler(docs, req, res);

            })

    })


})

router.post('/employee-study/study-employee/combine', (req, res) => {

    let emplID = req.body.emplID;
    let studyID = req.body.studyID;

    Study.findById(studyID).exec((err, study) => {

        if (err) {

            console.log(err);
            res.status(500).json(err);

        } else if (study == null) {

            errorHandler('study', 'not-found', res);

        } else
            Employee.findById(emplID).exec((err, employee) => {

                if (err) {

                    console.log(err);
                    res.status(500).json(err);

                } else if (employee == null) {

                    errorHandler('employee', 'not-found', res);

                } else {

                    study.StudyEmpl.push(emplID);
                    study.save((err, doc) => {

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

router.post('/employee-study/instructor/combine', (req, res) => {

    let emplID = req.body.emplID;
    let studyID = req.body.studyID;

    Study.findById(studyID).exec((err, study) => {

        if (err) {

            console.log(err);
            res.status(500).json(err);

        } else if (study == null) {

            errorHandler('study', 'not-found', res);

        } else
            Employee.findById(emplID).exec((err, employee) => {

                if (err) {

                    console.log(err);
                    res.status(500).json(err);

                } else if (employee == null) {

                    errorHandler('employee', 'not-found', res);

                } else {

                    study.Instructor.push(emplID);
                    study.save((err, doc) => {

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

router.post('/employee-study/study-employee/divide', (req, res) => {

    let emplID = req.body.emplID;
    let studyID = req.body.studyID;

    Study.findById(studyID).exec((err, study) => {

        if (err) {

            console.log(err);
            res.status(500).json(err);

        } else if (study == null) {

            errorHandler('study', 'not-found', res);

        } else
            Employee.findById(emplID).exec((err, employee) => {

                if (err) {

                    console.log(err);
                    res.status(500).json(err);

                } else if (employee == null) {

                    errorHandler('employee', 'not-found', res);

                } else {

                    study.StudyEmpl.pop(emplID);
                    study.save((err, doc) => {

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

router.post('/employee-study/instructor/divide', (req, res) => {

    let emplID = req.body.emplID;
    let studyID = req.body.studyID;

    Study.findById(studyID).exec((err, study) => {

        if (err) {

            console.log(err);
            res.status(500).json(err);

        } else if (study == null) {

            errorHandler('study', 'not-found', res);

        } else
            Employee.findById(emplID).exec((err, employee) => {

                if (err) {

                    console.log(err);
                    res.status(500).json(err);

                } else if (employee == null) {

                    errorHandler('employee', 'not-found', res);

                } else {

                    study.Instructor.pop(emplID);
                    study.save((err, doc) => {

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

/************************SEMINAR + EMPLOYEE*****************************/
router.get('/employee-seminar/seminar-list/by-employee/:id', (req, res) => {

    let emplID = req.params.id;

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