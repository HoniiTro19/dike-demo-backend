const express = require('express');
const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const {enqueue, dequeue} = require('../taskqueue');
const router = express.Router();

async function runBenchmark(propsFile, resultDir) {
    // resolve path, propsFile: front-end properties file, resultDir: Dike output directory
    const dikeDir = path.resolve('../Dike');
    const runDir = path.join(dikeDir, 'run');
    const resultCSV = path.join(runDir, resultDir, 'data', 'aggregation.csv');
    const errorFile = path.join(propsFile, '..', 'error.out');
    const logFile = path.join(propsFile, '..', 'log.out');
    const resultFile = path.join(propsFile, '..', 'result.csv');
    const cmd = 'cd ' + runDir + ' && ./runBenchmark.sh ' + propsFile;
    try {
        const { stdout, stderr } = await exec(cmd)
        if (stderr) {
            fs.writeFileSync(errorFile, stderr);
        } else {
            const mvResult = 'mv ' + resultCSV + ' ' + resultFile;
            exec(mvResult, (error) => {
                if (error) {
                    console.error('mv error: ' + error);
                }
            });
        }
        fs.writeFileSync(logFile, stdout);
        return {stdout, stderr};
    } catch (err) {
        fs.writeFileSync(errorFile, err);
        return err;
    }
};

/* POST properties. */
router.post('/', function (req, res) {
    // create specific working directory for each task
    let dirPath = path.resolve(__dirname, '..');
    let curDate = new Date();
    let curPath = path.join(dirPath, 'public', 'histories', curDate.toISOString());
    if (!fs.existsSync(curPath)) {
        fs.mkdirSync(curPath, { recursive: true });
    } else {
        res.status(500).send('task already exists');
        return;
    }

    // complete properties and write down to properties file
    let propsFile = path.join(curPath, "run.properties");
    let propsObj = req.body
    const resultDir = path.join('results', propsObj['db'], curDate.toISOString());
    propsObj['resultDirectory'] = resultDir;
    propsObj['terminalRange'] = propsObj['leftRange'] + ',' + propsObj['rightRange'];
    propsObj['transactions'] = propsObj['newOrder'] + ',' + propsObj['payment'] + ',' + propsObj['orderStatus'] + ',' + propsObj['delivery'] + ',' + propsObj['stockLevel'] + ',' + propsObj['updateItem'] + ',' + propsObj['updateStock'] + ',' + propsObj['globalDeadlock'] + ',' + propsObj['globalSnapshot'];
    propsObj['terminalRange'] = '1,' + propsObj['warehouses'];
    let properties = Object.entries(propsObj)
                           .map(x => x.join("="))
                           .join("\n");
    fs.writeFileSync(propsFile, properties, err => {
        if (err) {
            res.status(500).send('fail to write down properties file');
            return;
        }
    })

    // push task in message queue
    enqueue(runBenchmark(propsFile, resultDir));
    res.send('enqueue task');
});

module.exports = router;