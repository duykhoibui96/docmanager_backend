var listResponseHandler = require('./list-reponse-handler');
var errorHandler = require('./error-handler');

function getInstance(id) {

    switch (id) {
        case 'EmplID':
            return 'employee';
        case 'CustomerID':
            return 'customer';
        case 'SeminarID':
            return 'seminar';
        case 'StudyID':
            return 'study';
        case 'ConsultancyID':
            return 'consultancy';
    }

    return null;

}

function Restful_API(model, collectionID) {

    this.fetch = (req, res) => {

        model.find().lean().select(`${collectionID} Name`).exec((err, docs) => {

            if (err) {
                console.log(err);
                res.status(500).json();
            } else {

                let searchText = req.query.searchText.toLowerCase();

                // let number = Number(searchText);

                // let list = docs.filter(item => {

                //     let valid = false;

                //     if ((!isNaN(number) && item[collectionID] === number) || item.Name.toLowerCase().includes(searchText))
                //         valid = true;

                //     return valid;


                // });

                console.log(collectionID);
                let list = docs.filter(item => {

                    let idAsString = item[collectionID].toString();
                    return idAsString.includes(searchText) || item.Name.toLowerCase().includes(searchText);

                })

                if (list.length === 0)
                    errorHandler(collectionID, 'not-found', res, true);
                else
                    res.json(list.length <= 5 ? list : list.slice(0, 5));
            }

        })


    }

    this.list = (req, res) => {

        switch (collectionID) {

            case 'ConsID':
                model
                    .find()
                    .populate('ConsultingEmpl', 'EmplID Name')
                    .populate('Customer', 'CustomerID Name')
                    .lean()
                    .exec((err, docs) => {

                        if (err) {
                            console.log(err);
                            res.status(500).json();
                        } else
                            listResponseHandler(docs, req, res);

                    })
                break;
            case 'SeminarID':
                model
                    .find()
                    .populate('SharingEmpl', 'EmplID Name')
                    .lean()
                    .exec((err, docs) => {

                        if (err) {
                            console.log(err);
                            res.status(500).json();
                        } else
                            listResponseHandler(docs, req, res);

                    })
                break;
            case 'StudyID':
                model
                    .find()
                    .populate('Seminar', 'SeminarID Name')
                    .lean()
                    .exec((err, docs) => {

                        if (err) {
                            console.log(err);
                            res.status(500).json();
                        } else
                            listResponseHandler(docs, req, res);

                    })
                break;
            default:
                model
                    .find()
                    .lean()
                    .exec((err, docs) => {

                        if (err) {
                            console.log(err);
                            res.status(500).json();
                        } else
                            listResponseHandler(docs, req, res);

                    })
                break;

        }


    };

    this.get = (req, res) => {

        let idObject = {

            [collectionID]: req.params.id

        }

        switch (collectionID) {

            case 'ConsID':
                model
                    .findOne(idObject)
                    .populate('ConsultingEmpl', 'EmplID Name')
                    .populate('Customer', 'CustomerID Name')
                    .populate('Documents')
                    .exec((err, doc) => {

                        if (err) {
                            console.log(err);
                            res.status(500).json();
                        } else if (doc == null)
                            errorHandler(collectionID, 'not-found', res, true);
                        else
                            res.json(doc);


                    })
                break;
            case 'SeminarID':
                model
                    .findOne(idObject)
                    .populate('SharingEmpl', 'EmplID Name')
                    .lean()
                    .exec((err, doc) => {

                        if (err) {
                            console.log(err);
                            res.status(500).json();
                        } else if (doc == null)
                            errorHandler(collectionID, 'not-found', res, true);
                        else
                            res.json(doc);

                    })
                break;
            case 'StudyID':
                model
                    .findOne(idObject)
                    .populate('Instructor', 'EmplID Name')
                    .populate('Seminar', 'SeminarID Name')
                    .lean()
                    .exec((err, doc) => {

                        if (err) {
                            console.log(err);
                            res.status(500).json();
                        } else if (doc == null)
                            errorHandler(collectionID, 'not-found', res, true);
                        else
                            res.json(doc);

                    })
                break;
            default:
                model.findOne(idObject, (err, doc) => {

                    if (err) {
                        console.log(err);
                        res.status(500).json();
                    } else if (doc == null)
                        errorHandler(collectionID, 'not-found', res, true);
                    else
                        res.json(doc);


                })
                break;

        }

    };

    this.getById = (req, res) => {

        model.findById(req.params.id)
            .exec((err, doc) => {

                if (err) {
                    console.log(err);
                    res.status(500).json(err);
                } else if (doc == null)
                    errorHandler(collectionID, 'not-found', res, true);
                else
                    res.json(doc);


            })

    }

    this.update = (req, res) => {

        let idObject = {

            [collectionID]: req.params.id

        }

        model.findOneAndUpdate(idObject, req.body, {
            new: true
        }, (err, doc) => {

            console.log(doc);
            if (err) {
                console.log(err);
                res.status(500).json();
            } else if (doc == null)
                errorHandler(collectionID, 'not-found', res, true);
            else
                res.json(doc);


        })

    };
    this.delete = (req, res) => {

        let idObject = {

            [collectionID]: req.params.id

        }

        model.findOneAndRemove(idObject, (err, doc) => {

            if (err) {
                console.log(err);
                res.status(500).json();
            } else if (doc == null)
                errorHandler(collectionID, 'not-found', res, true);
            else
                res.json(doc);


        })


    };
    this.create = (req, res) => {

        let newObject = new model(req.body);

        newObject.save((err, doc) => {

            if (err) {
                console.log(err);
                res.status(500).json();
            } else
                res.json(doc);


        })

    };

}

module.exports = Restful_API;