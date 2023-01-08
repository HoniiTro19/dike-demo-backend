const express = require('express');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const router = express.Router();

/* GET result. */
router.get('/', function (req, res) {
    const configFile = path.join(__dirname, '..', 'public', 'histories', req.query.runid, 'run.properties');
    if (!fs.existsSync(configFile)) {
        res.status(500).send('can not find the configuration file');
        return;
    }

    const kvmap = Object.fromEntries(
        fs.readFileSync(configFile, 'utf-8')
            .split("\n")
            .map((line) => [line.split("=")[0], line.split("=")[1]])
    );

    const resultCSV = path.join(__dirname, '..', 'public', 'histories', req.query.runid, 'result.csv');
    if (!fs.existsSync(resultCSV)) {
        res.status(500).send('the task has not finished');
        return;
    }

    const groupBy = (objects, keys) => {
        const groups = {};
        keys.forEach((key) => {
            groups[key] = [];
            objects.forEach((object) => groups[key].push(object[key]))
        })
        return groups;
    }

    let columns;
    fs.createReadStream(resultCSV)
        .pipe(csv())
        .on('headers', (headers) => {
            columns = headers;
        })

    const results = [];
    fs.createReadStream(resultCSV)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.send({
                results: groupBy(results, columns),
                txnType: ['NEW_ORDER', 'PAYMENT', 'ORDER_STATUS', 'DELIVERY', 'STOCK_LEVEL', 'UPDATE_ITEM', 'UPDATE_STOCK', 'GLOBAL_DEADLOCK', 'GLOBAL_SNAPSHOT'],
                des: kvmap.description
            });
        })
});

module.exports = router;