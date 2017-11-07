var Document = require('../models/Document');
var Study = require('../models/Study');
var Seminar = require('../models/Seminar');
var Consultancy = require('../models/Consultancy');
var errorHandler = require('../helpers/error-handler');
var listResponseHandler = require('../helpers/list-reponse-handler');
var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');

var storage = multer.diskStorage({
    destination: './files/',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

var upload = multer({
    storage: storage
}).any(); // multer configuration

router.get('/search', (req, res) => {

    let searchParams = req.query;
    let model = searchParams.collection === 'consultancy' ?
        Consultancy : Study;
    let id = searchParams.collectionID;

    model.findById(id)
        .populate('Documents')
        .select('Documents')
        .exec((err, doc) => {

            console.log(doc);
            if (err) {

                console.log(err);
                res.status(500).json(err);

            } else if (doc == null)
                errorHandler(searchParams.collection, 'not-found', res);
            else
                listResponseHandler(doc.Documents, req, res);


        })



})

router.post('/search', (req, res) => {

    let searchParams = req.body;
    if (searchParams.keyWord)
        searchParams.keyWord = searchParams.keyWord.toLowerCase();
    console.log(searchParams);

    console.log('get here');
    let studySearchPromise = new Promise((resolve, reject) => {

        if (searchParams.collection === 'consultancy')
            resolve([]);
        else {

            let searchFunc = searchParams.collectionRecord ?
                Study.findById(searchParams.collectionRecord) :
                Study.find();

            searchFunc
                .populate('Documents')
                .select('Documents')
                .lean()
                .exec((err, data) => {

                    if (err) {
                        console.log(err);
                        res.status(500).json(err);
                        reject(err);
                    } else if (searchParams.collectionRecord) {

                        if (data == null)
                            resolve([]);
                        else
                            resolve(data.Documents);
                    } else {

                        let list = data;
                        if (list.length === 0)
                            resolve([]);
                        else {

                            let resultList = [];
                            list.forEach(item => {

                                resultList = resultList.concat(item.Documents);

                            })

                            resolve(resultList);

                        }



                    }


                })


        }


    })

    let consultancySearchPromise = new Promise((resolve, reject) => {

        if (searchParams.collection === 'study')
            resolve([]);
        else {

            let searchFunc = searchParams.collectionRecord ?
                Consultancy.findById(searchParams.collectionRecord) :
                Consultancy.find();

            searchFunc
                .populate('Documents')
                .select('Documents')
                .lean()
                .exec((err, data) => {

                    if (err) {
                        console.log(err);
                        res.status(500).json(err);
                        reject(err);
                    } else if (searchParams.collectionRecord) {

                        console.log(data);
                        if (data == null)
                            resolve([]);
                        else
                            resolve(data.Documents);
                    } else {

                        let list = data;
                        if (list.length === 0)
                            resolve([]);
                        else {

                            let resultList = [];
                            list.forEach(item => {

                                resultList = resultList.concat(item.Documents);

                            })


                            resolve(resultList);

                        }



                    }


                })


        }


    })

    Promise.all([studySearchPromise, consultancySearchPromise])
        .then(results => {

            let list = results[0].concat(results[1]);
            let resultList = list;
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

            if (startDate || endDate || searchParams.keyWord)
                resultList = list.filter(item => {

                    let valid = true;
                    let date = new Date(item.date);
                    if (startDate)
                        valid = valid && startDate <= date;
                    if (endDate)
                        valid = valid && endDate >= date;

                    console.log(valid);
                    return valid && (searchParams.keyWord ? item.data.originalname.includes(searchParams.keyWord) : true);

                })

            console.log(resultList);
            listResponseHandler(resultList, req, res);

        })



})

router.get('/', (req, res) => {

    Document.find().exec((err, docs) => {

        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else
            listResponseHandler(docs, req, res);

    })

})

router.get('/fetch', (req, res) => {

    Document.find().select('data date').lean().exec((err, docs) => {

        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else {

            let searchText = req.query.searchText;

            let list = docs.filter(item => {

                let name = item.data.originalname;
                return name.includes(searchText);

            })

            if (list.length === 0)
                errorHandler('document', 'not-found', res);
            else
                res.json(list);

        }


    })

})

router.get('/:id', (req, res) => {

    let id = req.params.id;

    Document.findById(id).exec((err, doc) => {

        if (err) {

            console.log(err);
            res.status(500).json(err);

        } else if (doc == null)
            errorHandler('document', 'not-found', res);
        else
            res.json(doc);
    })

})

router.put('/resource-multiple-add/:id', (req, res) => {

    console.log(req.params);
    console.log(req.body);
    res.json('ok');

});

router.post('/resource-add', (req, res) => {

    let documents = req.body.documents;

    let collection = req.query.collection;
    let collectionID = req.query.collectionID;

    let model = collection === 'consultancy' ? Consultancy : Study;

    model.findByIdAndUpdate(collectionID, {

        $pushAll: {
            Documents: documents
        }

    }).exec((err, doc) => {

        if (err) {

            console.log(err);
            res.status(500).json(err);

        } else if (doc == null)
            errorHandler(collection, 'not-found', res);
        else
            res.json(doc);

    })

})

router.put('/resource-remove/:id', (req, res) => {

    let documents = req.body.documents;

    let collection = req.body.collection;
    let collectionID = req.body.collectionID;

    let model = collection === 'consultancy' ? Consultancy : Study;

    model.findByIdAndUpdate(collectionID, {

        $pull: {
            Documents: req.params.id
        }

    }).exec((err, doc) => {

        if (err) {

            console.log(err);
            res.status(500).json(err);

        } else if (doc == null)
            errorHandler(collection, 'not-found', res);
        else
            res.json(doc);

    })

})


router.post('/', (req, res) => {

    // let collection = req.query.collection === 'consultancy' ? Consultancy : Study;
    // let id = req.query.collectionID;

    // collection.findById(id).exec((err, doc) => {

    //     if (err) {
    //         console.log(err);
    //         res.status(500).json(err);
    //     } else if (doc == null)
    //         errorHandler(req.query.collection, 'not-found', res);
    //     else
    //         upload(req, res, (err) => {

    //             if (err) {
    //                 console.log(err);
    //                 res.status(422).json('upload-failed');
    //             } else {
    //                 let file = req.files[0];
    //                 let newDocument = new Document({

    //                     data: file

    //                 });

    //                 newDocument.save((err, document) => {

    //                     if (err) {
    //                         console.log(err);
    //                         res.status(500).json(err);
    //                     } else {
    //                         doc.Documents.push(document._id);
    //                         doc.save((err, doc) => {

    //                             if (err) {
    //                                 console.log(err);
    //                                 res.status(500).json(err);
    //                             } else
    //                                 res.json(file);



    //                         })
    //                     }



    //                 })
    //             }


    //         })

    // })

    // let collection = req.query.collection;
    // let id = req.query.id;

    upload(req, res, err => {

        if (err) {
            console.log(err);
            res.status(422).json('upload-failed');
        } else {

            let file = req.files[0];
            let document = new Document({

                data: file

            })

            document.save((err, doc) => {

                if (err) {
                    console.log(err);
                    res.status(500).json(err);
                } else
                    res.json(file);


            })

        }

    });


})

router.delete('/:id', (req, res) => {

    let searchParams = req.query;

    let collectionRemovePromise = new Promise((resolve, reject) => {

        if (!searchParams.collection) {
            resolve('done');
            return;
        }
        let model = searchParams.collection === 'consultancy' ?
            Consultancy : Study;

        model
            .findByIdAndUpdate(searchParams.collectionID, {

                $pull: {
                    Documents: req.params.id
                }

            }).exec((err, doc) => {

                if (err) {
                    console.log(err);
                    reject(err);
                } else if (doc == null)
                    reject({

                        type: 'not-found',
                        instance: searchParams.collection

                    })
                else
                    resolve('done');

            })



    })

    collectionRemovePromise.then(response => {

        console.log(response);
        Document.findByIdAndRemove(req.params.id)
            .exec((err, doc) => {

                if (err) {

                    console.log(err);
                    res.status(500).json(err);

                } else if (doc == null)
                    errorHandler('document', 'not-found', res);
                else {

                    fs.unlink(doc.data.path, (err) => {

                        if (err)
                            console.log(err);

                    })

                    res.json(doc);

                }



            })


    }).catch(err => {

        if (err.type)
            errorHandler(err.instance, err.type, res);
        else
            res.status(500).json(err);

    })



})

module.exports = router;