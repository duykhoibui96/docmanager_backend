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

function responseError(param, type, res, byID = false) {

    let instance = byID ? getInstance(param) : param;

    let errCode = type === 'not-found' ? 404 : 409;

    res.status(errCode).json({

        instance: instance,
        type: type

    })


}

module.exports = responseError;