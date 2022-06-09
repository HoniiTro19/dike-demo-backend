const express = require('express');
const path = require('path');
const { parse } = require('csv-parse');
const fs = require('fs');
const router = express.Router();

/* GET result. */
router.get('/', function (req, res) {
  const resCSV = path.join(__dirname, '..', 'public', 'histories', req.query.runid, 'result.csv');
  if (!fs.existsSync(resCSV)) {
    res.status(500).send('The Task Is Running');
    return;
  }
  const groupBy = (objectArray, property) => {
    return objectArray.reduce((acc, obj) => {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      // Add object to list for given key's value
      acc[key].push(obj);
      return acc;
    }, {});
  }

  let resultline = new Array();
  let linecnt = 0;
  fs.createReadStream(resCSV)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
      (row[5] === '0') && (row[6] === '0')
        && (resultline.push({
          elapsed: Math.floor(parseInt(row[1]) / 1000) + 1,
          latency: parseInt(row[2]),
          type: row[4]
        }))
        && (linecnt += 1)
    })
    .on("end", function () {
      res.send({
        group: groupBy(resultline, 'elapsed'),
        line: linecnt
      });
    })
});

module.exports = router;