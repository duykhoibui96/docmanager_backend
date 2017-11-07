module.exports = (docs, req, res) => {

    if (req.query.lastPage) {

        let totalSize = docs.length;
        let page = Math.ceil(totalSize / 10);
        let startIndex = 10 * (page - 1);
        let list = docs.slice(startIndex, startIndex + 10);

        res.json({

            renew: true,
            totalSize: totalSize,
            list: list,
            page: page

        });

    } else {

        let index = Number(req.query.index);
        let pageSize = Number(req.query.pageSize);

        let list = docs.slice(index, index + pageSize);
        let totalSize = docs.length;

        res.json({

            renew: false,
            totalSize: totalSize,
            list: list

        });

    }

}