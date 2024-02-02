const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbconfig = require('../../dbconfig');
const createError = require('http-errors');
const fs = require('fs');
const XlsxPopulate = require('xlsx-populate');
const { uploadMaster } = require('../modules/uploadFile');
const { transformRow, FieldLimit } = require('../modules/importMaster');

router.post('/:Table', async (req, res, next) => {
  let excelFile;
  try {
    excelFile = await uploadMaster(req, res);
    let { Table } = req.params;
    let workbook = await XlsxPopulate.fromFileAsync(excelFile);
    let rows = workbook.sheet(0).usedRange().value();
    let insertArr = new Array();
    let pool = await sql.connect(dbconfig);
    for (let index = 0; index < rows.length; index++) {
      // console.log(rows[index])
      if (rows[index].length != FieldLimit[Table]) return next(createError(400, 'Invalid Form'));
      if (!index) continue;
      insertArr.push(transformRow(pool, Table, rows[index]));
    }
    if (!insertArr.length) return next(createError(400, 'No data in uploaded file'));
    // let Data = await Promise.all(insertArr);
    // console.log(Data);
    res.status(200).send({ message: `Import to ${Table} Success` });
  } catch (err) {
    if (excelFile) fs.unlinkSync(excelFile);
    next(err);
  }
});

module.exports = router;
