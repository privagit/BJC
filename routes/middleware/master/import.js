const sql = require("mssql");
const dbconfig = require("../../../dbconfig");
const createError = require("http-errors");
const fs = require("fs");
const XlsxPopulate = require("xlsx-populate");
const { uploadMaster } = require("../../modules/uploadFile");
const { transformRow, FieldLimit } = require("../../modules/importMaster");

const removeFile = (filepath) => {
  if (filepath) fs.unlinkSync(filepath);
};

const importDatabase = async (req, res, next) => {
  let excelFile;
  try {
    excelFile = await uploadMaster(req, res);
    let Table = req.baseUrl.split("/")[1].split("_")[0];
    let workbook = await XlsxPopulate.fromFileAsync(excelFile);
    let rows = workbook.sheet(0).usedRange().value();
    let insertArr = new Array();
    let pool = await sql.connect(dbconfig);
    for (let index = 0; index < rows.length; index++) {
      // console.log(rows[index])
      if (rows[index].length != FieldLimit[Table]) {
        removeFile(excelFile);
        return next(createError(400, "Invalid Form"));
      }
      if (!index) continue;
      console.log(rows[index]);
      insertArr.push(transformRow(pool, Table, rows[index]));
    }
    if (!insertArr.length) {
      removeFile(excelFile);
      return next(createError(400, "No data in uploaded file"));
    }
    let Data = await Promise.all(insertArr);
    console.log(Data);
    req.result = "ok";
    req.message = `นำเข้าข้อมูล ${Table} สำเร็จ`;
    next();
  } catch (err) {
    removeFile(excelFile);
    next(err);
  }
};

module.exports = { importDatabase };
