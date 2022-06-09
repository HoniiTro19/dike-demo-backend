const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

/* GET histories. */
router.get('/', function (_req, res, _next) {
    const hisPath = path.join(__dirname, '..', 'public', 'histories');
    const allhistory = fs.readdirSync(hisPath);

    let metadata = new Array();
    allhistory.forEach(history => {
        const runDate = new Date(history).toISOString().slice(0, 10);
        let status;
        if (fs.existsSync(path.join(hisPath, history, 'error.out'))) {
            status = 'error';
        } else if (fs.existsSync(path.join(hisPath, history, 'result.csv'))) {
            status = 'success';
        } else {
            status = 'pending';
        }
        metadata.push({
            'runid': history,
            'date': runDate,
            'status': status
        })
    })
    res.send(metadata);
});

module.exports = router;