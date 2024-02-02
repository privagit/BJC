const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbconfig = require("../../dbconfig");
const createHttpError = require("http-errors");
const validate = require("../middleware/validate");
const { customerValidator, addCustomer, editCustomer } = require("../middleware/master/customer");
const { activate } = require("../modules/sqlUtils");
const { isAuthEdit } = require("../middleware/checkUser");
const { importDatabase } = require("../middleware/master/import");

router.get("/", async (req, res, next) => {
  console.log(req.baseUrl);
  try {
    let SelectCustomer = `SELECT CustomerId, CustomerCode, Customer,
        Address, Tel, Remark, Active
        FROM MasterCustomer
        WHERE Active != 2
        ORDER BY
          CASE WHEN ItemNo IS NULL THEN 1 ELSE 0 END ASC,
          ItemNo ASC
        `;
    let pool = await sql.connect(dbconfig);
    let Customer = await pool.request().query(SelectCustomer);
    res.status(200).send(JSON.stringify(Customer.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.use(isAuthEdit("customerSetting"));

router.post("/import", importDatabase, (req, res, next) => {
  res.status(201).send({ message: req.message });
});

router.post("/", validate(customerValidator), addCustomer, (req, res, next) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(201).send({ message: req.message });
});

router.put("/:CustomerId", validate(customerValidator), editCustomer, (req, res, next) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(200).send({ message: req.message });
});

router.put("/:CustomerId/deactivate", async (req, res, next) => {
  let { CustomerId } = req.params;
  try {
    await activate(0, "MasterCustomer", `CustomerId = ${CustomerId}`);
  } catch (err) {
    next(err);
  }
  res.status(200).send({ message: `ปิดการใช้งานข้อมูลลูกค้าสำเร็จ` });
});

router.put("/:CustomerId/activate", async (req, res, next) => {
  try {
    let { CustomerId } = req.params;
    await activate(1, "MasterCustomer", `CustomerId = ${CustomerId}`);
    res.status(200).send({ message: `เปิดการใช้งานข้อมูลลูกค้าสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

// ! Deprecated
router.delete("/:CustomerId", async (req, res, next) => {
  try {
    let { CustomerId } = req.params;
    const pool = await sql.connect(dbconfig);
    await pool.request().query(
      `DELETE FROM MasterCustomer
        WHERE CustomerId = ${CustomerId}`
    );
    res.status(200).send({ message: `ลบข้อมูลลูกค้าสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
