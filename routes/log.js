const express = require('express');
const path = require('path');
const fs = require('fs');
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

    const errFile = path.join(__dirname, '..', 'public', 'histories', req.query.runid, 'error.out');
    const infoFile = path.join(__dirname, '..', 'public', 'histories', req.query.runid, 'log.out');
    if (fs.existsSync(errFile)) {
        res.send({
            log: fs.readFileSync(errFile, 'utf-8'),
            des: kvmap.description
        });
    } else if (fs.existsSync(infoFile)) {
        res.send({
            log: fs.readFileSync(infoFile, 'utf-8'),
            des: kvmap.description
        });
    } else {
        res.status(500).send('can not find the output file');
        return;
    }
});

module.exports = router;