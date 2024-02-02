const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbconfig = require("../../dbconfig");
const createHttpError = require("http-errors");
const validate = require("../middleware/validate");
const { factoryValidator, editFactory, addFactory } = require("../middleware/master/factory");
const { isAuthEdit } = require("../middleware/checkUser");

router.get("/", async (req, res, next) => {
  try {
    let SelectFactory = `SELECT TOP 1 FactoryId, FactoryName, FactoryAddress, FactoryTel, GETDATE() AS CurrentDate
        FROM MasterFactory`;
    let pool = await sql.connect(dbconfig);
    let Factory = await pool.request().query(SelectFactory);
    res.status(200).send(Factory.recordset[0]);
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.use(isAuthEdit("factorySetting"));

router.post("/", validate(factoryValidator), addFactory, (req, res, next) => {
  res.status(200).send({ message: req.message });
});

router.put("/:FactoryId", validate(factoryValidator), editFactory, (req, res, next) => {
  res.status(200).send({ message: req.message });
});

module.exports = router;
