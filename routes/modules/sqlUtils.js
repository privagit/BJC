const sql = require("mssql");
const dbconfig = require("../../dbconfig");
const logger = require("../../libs/logger");

const checkDup = async (field, table, where) => {
  const pool = await sql.connect(dbconfig);
  const query = `
    SELECT ${field} as Id FROM ${table}
    WHERE ${where}
  `;
  const duplicate = await pool.request().query(query);
  if (!duplicate.recordset.length) return null;
  return parseInt(duplicate.recordset[0].Id);
};

const checkLen = async (field, table, where) => {
  const pool = await sql.connect(dbconfig);
  const query = `
    SELECT COUNT(${field}) as length FROM ${table}
    WHERE ${where}
  `;
  const duplicate = await pool.request().query(query);
  return duplicate.recordset[0].length;
};

const activate = async (active, table, where) => {
  const pool = await sql.connect(dbconfig);
  await pool.request().query(`UPDATE ${table}
      SET Active = ${active} WHERE ${where}`);
  logger.debug(`${where} activate ${active}`);
  return;
};

const fromToFilter = (Field, FromDate, ToDate, Type = "AND") =>
  FromDate && ToDate
    ? `${Type} DATEDIFF(day,${Field},'${FromDate}') <= 0 AND DATEDIFF(day,${Field},'${ToDate}') >= 0`
    : FromDate
    ? `${Type} DATEDIFF(day,${Field},'${FromDate}') = 0`
    : "";

const whereFilter = (Field, Value, Type = "AND") => (Value ? `${Type} ${Field} = ${Value}` : "");

module.exports = {
  checkDup,
  checkLen,
  activate,
  fromToFilter,
  whereFilter,
};
