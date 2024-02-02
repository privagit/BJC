const express = require("express");
const router = express.Router();
const sql = require("mssql");
const createHttpError = require("http-errors");
const dbconfig = require("../../dbconfig");
const validate = require("../middleware/validate");
const { vehicleTypeValidator, addVehicleType, editVehicleType } = require("../middleware/master/vehicle");
const { isAuthEdit } = require("../middleware/checkUser");
const { activate } = require("../modules/sqlUtils");

router.get("/", async (req, res, next) => {
  try {
    let SelectVehicleType = `SELECT row_number() over(order by VehicleType) as 'index',
      VehicleTypeId, VehicleType, Active
      FROM MasterVehicleType
      WHERE Active != 2
      ORDER BY ItemNo`;
    let pool = await sql.connect(dbconfig);
    let VehicleType = await pool.request().query(SelectVehicleType);
    res.status(200).send(JSON.stringify(VehicleType.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.post("/", validate(vehicleTypeValidator), addVehicleType, (req, res, next) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(201).send({ message: req.message });
});
router.use(isAuthEdit("vehicleSetting"));

router.post("/", validate(vehicleTypeValidator), addVehicleType, (req, res, next) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(201).send({ message: req.message });
});

router.put("/:VehicleTypeId", validate(vehicleTypeValidator), editVehicleType, (req, res, next) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(200).send({ message: req.message });
});
router.put("/:VehicleTypeId", validate(vehicleTypeValidator), editVehicleType, (req, res, next) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(200).send({ message: req.message });
});

router.put("/:VehicleTypeId/deactivate", async (req, res, next) => {
  try {
    let { VehicleTypeId } = req.params;
    await activate(0, "MasterVehicleType", `VehicleTypeId = ${VehicleTypeId}`);
    res.status(200).send({ message: `ปิดการใช้งานข้อมูลประเภทรถสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

router.put("/:VehicleTypeId/activate", async (req, res, next) => {
  try {
    let { VehicleTypeId } = req.params;
    await activate(1, "MasterVehicleType", `VehicleTypeId = ${VehicleTypeId}`);
    res.status(200).send({ message: `เปิดการใช้งานข้อมูลประเภทรถสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

// ! Deprecated
router.delete("/:VehicleTypeId", async (req, res, next) => {
  try {
    let { VehicleTypeId } = req.params;
    const pool = await sql.connect(dbconfig);
    await pool.request().query(
      `DELETE FROM MasterVehicleType
        WHERE VehicleTypeId = ${VehicleTypeId}`
    );
    res.status(200).send({ message: `ลบข้อมูลประเภทรถสำเร็จ` });
  } catch (err) {
    next(createHttpError(500, err));
  }
});

module.exports = router;
