const express = require('express');
const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const enqueue = require('../taskqueue');
const router = express.Router();

/* TODO turn this async function into actual run benchmark scripts and complete result.csv and error.out copy*/
async function lsWithGrep() {
    try {
        const { stdout, stderr } = await exec('ls | grep js');
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
    } catch (err) {
        console.error(err);
    };
};

/* POST properties. */
router.post('/', function (req, res, next) {
    let dirPath = path.resolve(__dirname, '..');
    let curDate = new Date();
    let curPath = path.join(dirPath, 'public', 'histories', curDate.toISOString());
    if (!fs.existsSync(curPath)) {
        fs.mkdirSync(curPath, { recursive: true });
    } else {
        res.status(500).send('Directory Already Exists');
    }

    let propsFile = path.join(curPath, "run.properties");
    let properties = Object.entries(req.body).map(x => x.join("=")).join("\n");
    fs.writeFileSync(propsFile, properties, err => {
        if (err) {
            res.status(500).send('Fail To Write Down Properties File');
        }
    })
    enqueue(lsWithGrep);
    console.log(properties);
    res.send('ok');
});

module.exports = router;