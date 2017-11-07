var router = require("express").Router();
var Employee = require("../models/Employee");
var Study = require("../models/Study");
var listResponseHandler = require("../helpers/list-reponse-handler");
var errorHandler = require("../helpers/error-handler");

/************************STUDY + EMPLOYEE*****************************/
router.get('/study-list/by-employee/:id', (req, res) => {

    let emplID = req.params.id != 'current' ? req.params.id : req.userData.id;

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
            .populate('Seminar', 'SeminarID Name')
            .exec((err, docs) => {

                if (err) {
                    console.log(err);
                    res.status(500).json(err);
                } else
                    listResponseHandler(docs, req, res);

            })

    })


})

router.get('/instruction-list/by-employee/:id', (req, res) => {

    let emplID = req.params.id != 'current' ? req.params.id : req.userData.id;

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
            .populate('Seminar', 'SeminarID Name')
            .exec((err, docs) => {

                if (err) {
                    console.log(err);
                    res.status(500).json(err);
                } else
                    listResponseHandler(docs, req, res);

            })

    })


})

router.post('/study-employee/combine', (req, res) => {

    let emplID = req.body.emplID ? req.body.emplID : req.userData.id;
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

router.post('/instructor/combine', (req, res) => {

    let emplID = req.body.emplID ? req.body.emplID : req.userData.id;
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

router.post('/study-employee/divide', (req, res) => {

    let emplID = req.body.emplID ? req.body.emplID : req.userData.id;
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

router.post('/instructor/divide', (req, res) => {

    let emplID = req.body.emplID ? req.body.emplID : req.userData.id;
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

module.exports = router;