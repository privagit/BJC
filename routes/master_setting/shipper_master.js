const express = require("express");
const router = express.Router();
const sql = require("mssql");
const createHttpError = require("http-errors");
const dbconfig = require("../../dbconfig");
const validate = require("../middleware/validate");
const { shipperValidator, addShipper, editShipper } = require("../middleware/master/vehicle");
const { isAuthEdit } = require("../middleware/checkUser");
const { activate } = require("../modules/sqlUtils");

router.get("/", async (req, res, next) => {
  try {
    let SelectShipper = `SELECT row_number() over(order by Shipper) as 'index',
      ShipperId, Shipper, Active
      FROM MasterShipper
      WHERE Active != 2
      ORDER BY
          CASE WHEN ItemNo IS NULL THEN 1 ELSE 0 END ASC,
          ItemNo ASC
      `;
    let pool = await sql.connect(dbconfig);
    let Shipper = await pool.request().query(SelectShipper);
    res.status(200).send(JSON.stringify(Shipper.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.use(isAuthEdit("vehicleSetting"));

router.post("/", validate(shipperValidator), addShipper, (req, res, next) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(201).send({ message: req.message });
});

router.put("/:ShipperId", validate(shipperValidator), editShipper, (req, res, next) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(200).send({ message: req.message });
});
router.put("/:ShipperId", validate(shipperValidator), editShipper, (req, res, next) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(200).send({ message: req.message });
});

router.put("/:ShipperId/deactivate", async (req, res, next) => {
  try {
    let { ShipperId } = req.params;
    await activate(0, "MasterShipper", `ShipperId = ${ShipperId}`);
    res.status(200).send({ message: `ปิดการใช้งานข้อมูลบริษัทขนส่งสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

router.put("/:ShipperId/activate", async (req, res, next) => {
  try {
    let { ShipperId } = req.params;
    await activate(1, "MasterShipper", `ShipperId = ${ShipperId}`);
    res.status(200).send({ message: `เปิดการใช้งานข้อมูลบริษัทขนส่งสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

// ! Deprecated
router.delete("/:ShipperId", async (req, res, next) => {
  try {
    let { ShipperId } = req.params;
    const pool = await sql.connect(dbconfig);
    await pool.request().query(
      `DELETE FROM MasterShipper
        WHERE ShipperId = ${ShipperId}`
    );
    res.status(200).send({ message: `ลบข้อมูลบริษัทขนส่งสำเร็จ` });
  } catch (err) {
    next(createHttpError(500, err));
  }
});

module.exports = router;
