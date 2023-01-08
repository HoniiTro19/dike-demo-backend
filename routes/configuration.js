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
    const config = fs.readFileSync(configFile, 'utf-8');
    const kvmap = Object.fromEntries(
                  config.split("\n")
                        .map((line) => [line.split("=")[0], line.split("=")[1]])
    );

    res.send({
        config: config,
        des: kvmap.description
    });
});

module.exports = router;