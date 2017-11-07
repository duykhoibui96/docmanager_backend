var Employee = require('../models/Employee');
var Customer = require('../models/Customer');
var Consultancy = require('../models/Consultancy');
var Study = require('../models/Study');
var Seminar = require('../models/Seminar');
var Document = require('../models/Document');
var formatResult = require('./list-reponse-handler');

var _ = require("lodash");

function searchInTime(list, startDate, endDate, timeMode) {

    let start = null;
    let end = null;

    if (timeMode === "all")
        return list;

    if (timeMode.includes("days-recent")) {
        let array = timeMode.split('-');
        let numbersOfDay = Number(array[0]);
        end = new Date();
        start = new Date();
        start.setTime(end.getTime() - 86400000 * numbersOfDay);
    } else {

        if (startDate)
            start = new Date(Number(startDate));
        if (endDate)
            end = new Date(Number(endDate));

    }

    console.log(start);
    console.log(end);

    return list.filter(item => {

        let valid = true;
        let time = new Date(item.Time);
        if (start)
            valid = valid && start <= time;
        if (end)
            valid = valid && end >= time;
        return valid;
    })

}

function search(req, res) {

    return new Promise((resolve, reject) => {

            switch (req.params.collection) {

                case 'employees':
                    employeeSearch(req, resolve, reject);
                    break;
                case 'consultancies':
                    consultancySearch(req, resolve, reject);
                    break;
                case 'studies':
                    studySearch(req, resolve, reject);
                    break;
                case 'seminars':
                    seminarSearch(req, resolve, reject);
                    break;
                case 'customers':
                    customerSearch(req, resolve, reject);
                    break;
                case 'documents':
                    documentSearch(req, resolve, reject);
                    break;

            }


        })
        .then(list => formatResult(list, req, res))
        .catch(err => res.status(500).send(err));


}

function employeeSearch(req, resolve, reject) {

    let keyWord = req.query.keyWord;
    let mode = req.query.mode;

    console.log(req.query);

    let fullList = new Promise((resolve, reject) => {

        if (mode === "consulted") return resolve([]);
        Employee
            .find()
            .lean()
            .exec((err, docs) => {

                if (err) {

                    console.log(err);
                    reject(err);

                } else resolve(docs);

            })



    })

    let consultedEmpl = new Promise((resolve, reject) => {

        if (!mode) return resolve([]);
        Consultancy
            .find()
            .lean()
            .select("ConsultingEmpl")
            .populate("ConsultingEmpl")
            .exec((err, docs) => {

                if (err) {

                    console.log(err);
                    reject(err);

                } else {

                    let formatList = docs.filter(item => item.ConsultingEmpl);
                    let list = formatList.map(item => item.ConsultingEmpl);
                    resolve(list);

                }


            })

    })

    Promise
        .all([fullList, consultedEmpl])
        .then(results => {

            let finalList = null;
            switch (mode) {

                case "consulted":
                    finalList = results[1];
                    break;

                case "not-consult":
                    finalList = _.differenceWith(results[0], results[1], (value, other) => value._id === other._id);
                    break;

                default:
                    finalList = results[0];

            }

            let retList = finalList;
            console.log("Hello" + retList.length);
            if (keyWord) {

                let regExp = new RegExp(keyWord, 'i');
                retList = finalList.filter(item =>

                    item.Name.search(regExp) != -1 ||
                    (item.ChildDepartment ? item.ChildDepartment.search(regExp) != -1 : false) ||
                    (item.OfficerCode ? item.OfficerCode.search(regExp) != -1 : false) ||
                    (item.JobTitle ? item.JobTitle.search(regExp) != -1 : false) ||
                    (item.Mail ? item.Mail.search(regExp) != -1 : false)

                )
            }

            resolve(retList);

        })
        .catch(err => reject(err));


}

function consultancySearch(req, resolve, reject) {

    let keyWord = req.query.keyWord;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    let timeMode = req.query.timeMode;

    let fullList = new Promise((resolve, reject) => {

        let searchObj = {};

        Consultancy
            .find(searchObj)
            .lean()
            .populate('ConsultingEmpl', 'Name')
            .populate('Customer', 'Name')
            .exec((err, docs) => {

                if (err) {

                    console.log(err);
                    reject(err);

                } else resolve(docs);

            })



    })

    fullList
        .then(result => {

            let finalList = result;

            console.log("Got here");
            finalList = searchInTime(finalList, startDate, endDate, timeMode);
            let retList = finalList;
            console.log("Got here");

            if (keyWord) {

                let regExp = new RegExp(keyWord, 'i');
                retList = finalList.filter(item =>

                    item.Name.search(regExp) != -1 ||
                    (item.Content ? item.Content.search(regExp) != -1 : false) ||
                    (item.ConsultedPerson ? item.ConsultedPerson.search(regExp) != -1 : false)

                )
            }

            resolve(retList);

        })
        .catch(err => reject(err));

}

function studySearch(req, resolve, reject) {

    let keyWord = req.query.keyWord;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    let timeMode = req.query.timeMode;

    let fullList = new Promise((resolve, reject) => {

        let searchObj = {};

        Study
            .find(searchObj)
            .lean()
            .populate('Seminar', 'Name')
            .exec((err, docs) => {

                if (err) {

                    console.log(err);
                    reject(err);

                } else resolve(docs);

            })



    })

    fullList
        .then(result => {

            let finalList = result;

            console.log("Got here");
            finalList = searchInTime(finalList, startDate, endDate, timeMode);
            let retList = finalList;
            console.log("Got here");

            if (keyWord) {

                let regExp = new RegExp(keyWord, 'i');
                retList = finalList.filter(item =>

                    item.Name.search(regExp) != -1 ||
                    (item.Content ? item.Content.search(regExp) != -1 : false)

                )
            }

            resolve(retList);

        })
        .catch(err => reject(err));

}

function documentSearch(req, resolve, reject) {

    let keyWord = req.query.keyWord;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    let timeMode = req.query.timeMode;

    let fullList = new Promise((resolve, reject) => {

        Document
            .find()
            .lean()
            .exec((err, docs) => {

                if (err) {

                    console.log(err);
                    reject(err);

                } else resolve(docs);

            })



    })

    fullList
        .then(result => {

            let finalList = result;

            finalList = searchInTime(finalList, startDate, endDate, timeMode);
            let retList = finalList;

            if (keyWord) {

                let regExp = new RegExp(keyWord, 'i');
                retList = finalList.filter(item =>

                    item.data.originalname.search(regExp) != -1

                )
            }

            resolve(retList);

        })
        .catch(err => reject(err));

}

function customerSearch(req, resolve, reject) {

    let keyWord = req.query.keyWord;
    let mode = req.query.mode;

    let fullList = new Promise((resolve, reject) => {

        if (mode == "consulted") return resolve([]);
        Customer
            .find()
            .lean()
            .exec((err, docs) => {

                if (err) {

                    console.log(err);
                    reject(err);

                } else resolve(docs);

            })



    })

    let consultedCustomer = new Promise((resolve, reject) => {

        if (!mode) return resolve([]);
        Consultancy
            .find()
            .lean()
            .select("Customer")
            .populate("Customer")
            .exec((err, docs) => {

                if (err) {

                    console.log(err);
                    reject(err);

                } else {

                    let formatList = docs.filter(item => item.Customer);
                    let list = formatList.map(item => item.Customer)
                    resolve(list);

                }


            })

    })

    Promise
        .all([fullList, consultedCustomer])
        .then(results => {

            let finalList = null;
            switch (mode) {

                case "consulted":
                    finalList = results[1];
                    break;

                case "not-consulted":
                    finalList = _.differenceWith(results[0], results[1], (value, other) => value._id === other._id);
                    break;

                default:
                    finalList = results[0];

            }

            let retList = finalList;
            if (keyWord) {

                let regExp = new RegExp(keyWord, 'i');
                retList = finalList.filter(item =>

                    item.Name.search(regExp) != -1 ||
                    (item.Address ? item.Address.search(regExp) != -1 : false) ||
                    (item.Phone ? item.Phone.search(regExp) != -1 : false) ||
                    (item.Representative ? item.Representative.search(regExp) != -1 : false)

                )
            }

            resolve(retList);

        })
        .catch(err => reject(err));

}

function seminarSearch(req, resolve, reject) {

    let keyWord = req.query.keyWord;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    let timeMode = req.query.timeMode;

    let fullList = new Promise((resolve, reject) => {

        let searchObj = {};

        Seminar
            .find(searchObj)
            .populate('SharingEmpl','Name')
            .lean()
            .exec((err, docs) => {

                if (err) {

                    console.log(err);
                    reject(err);

                } else resolve(docs);

            })



    })

    fullList
        .then(result => {

            let finalList = result;

            console.log("Got here");
            finalList = searchInTime(finalList, startDate, endDate, timeMode);
            let retList = finalList;
            console.log("Got here");

            if (keyWord) {

                let regExp = new RegExp(keyWord, 'i');
                retList = finalList.filter(item =>

                    item.Name.search(regExp) != -1 ||
                    (item.Content ? item.Content.search(regExp) != -1 : false) ||
                    (item.OrganizationalUnit ? item.OrganizationalUnit.search(regExp) != -1 : false)

                )
            }

            resolve(retList);

        })
        .catch(err => reject(err));

}

module.exports = search;