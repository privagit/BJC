const express = require("express");
const router = express.Router();
const sql = require("mssql");
const path = require("path");
const dbconfig = require("../../dbconfig");
const {
  getWeightPlanReport,
  getMolassesReport,
  getSummaryMolassesReport,
  getMolassesCustomerReport,
  writeXlsx,
  fillWeightPlanReport,
  fillMolassesReport,
  fillMolassesCustomerReport,
  fillScaleListReport,
} = require("../modules/report");
const { getWeightCards } = require("../modules/weight");
const { getDateTime, checkDate } = require("../../libs/date");
const XlsxPopulate = require("xlsx-populate");

router.get("/scalelist", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Cards = await pool.request().query(getWeightCards(req.query));
    res.status(200).send(JSON.stringify(Cards.recordset));
  } catch (err) {
    next(err);
  }
});
router.get("/export/scalelist", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Cards = await pool.request().query(getWeightCards(req.query));
    const filename = `ScaleList.xlsx`;
    const wb = await XlsxPopulate.fromFileAsync("./template/report_cardlist.xlsx");
    const ws = wb.sheet(0);
    await fillScaleListReport(ws, Cards.recordset, req.query);
    await writeXlsx(wb, filename);
    res.status(200).download(path.join(process.cwd(), `/public/report/${filename}`));
  } catch (err) {
    next(err);
  }
});

router.get("/plan", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Cards = await pool.request().query(getWeightPlanReport(req.query));
    res.status(200).send(JSON.stringify(Cards.recordset));
  } catch (err) {
    next(err);
  }
});
router.get("/export/plan", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);

    const Cards = await pool.request().query(getWeightPlanReport(req.query));

    const filename = `PlanReport.xlsx`;
    const wb = await XlsxPopulate.fromFileAsync("./template/report_weight.xlsx");
    const ws = wb.sheet(0);
    await fillWeightPlanReport(ws, Cards.recordset, req.query);
    await writeXlsx(wb, filename);
    res.status(200).download(path.join(process.cwd(), `/public/report/${filename}`));
  } catch (err) {
    next(err);
  }
});

router.get("/molasses", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Cards = await pool.request().query(getMolassesReport(req.query));
    res.status(200).send(JSON.stringify(Cards.recordset));
  } catch (err) {
    next(err);
  }
});
router.get("/molasses/summary", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Summary = await pool.request().query(getSummaryMolassesReport(req.query));
    res.status(200).send(Summary);
  } catch (err) {
    next(err);
  }
});
router.get("/export/molasses", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Cards = await pool.request().query(getMolassesReport(req.query));
    const Summary = await pool.request().query(getSummaryMolassesReport(req.query));
    const filename = `MolassesReport.xlsx`;
    const wb = await XlsxPopulate.fromFileAsync("./template/report_molasses.xlsx");
    const ws = wb.sheet(0);
    await fillMolassesReport(ws, Cards.recordset, Summary.recordset, req.query);
    await writeXlsx(wb, filename);
    res.status(200).download(path.join(process.cwd(), `/public/report/${filename}`));
  } catch (err) {
    next(err);
  }
});

router.get("/molasses/customer", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Cards = await pool.request().query(getMolassesCustomerReport(req.query));
    res.status(200).send(JSON.stringify(Cards.recordset));
  } catch (err) {
    next(err);
  }
});
router.get("/export/molasses/customer", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Cards = await pool.request().query(getMolassesCustomerReport(req.query));
    const Summary = await pool.request().query(getSummaryMolassesReport(req.query));
    const filename = `MolassesCustomerReport.xlsx`;
    const wb = await XlsxPopulate.fromFileAsync("./template/report_molasses_customer.xlsx");
    const ws = wb.sheet(0);
    await fillMolassesCustomerReport(ws, Cards.recordset, Summary.recordset, req.query);
    await writeXlsx(wb, filename);
    res.status(200).download(path.join(process.cwd(), `/public/report/${filename}`));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
