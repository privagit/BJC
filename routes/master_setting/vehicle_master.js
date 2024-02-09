const express = require("express");
const router = express.Router();
const sql = require("mssql");
const createHttpError = require("http-errors");
const dbconfig = require("../../dbconfig");
const validate = require("../middleware/validate");
const {
  vehicleValidator,
  vehicleTypeValidator,
  shipperValidator,
  addShipper,
  addVehicleType,
  addVehicle,
  editVehicle,
} = require("../middleware/master/vehicle");
const { isAuthEdit } = require("../middleware/checkUser");
const { importDatabase } = require("../middleware/master/import");
const { activate } = require("../modules/sqlUtils");

router.get("/", async (req, res, next) => {
  try {
    let SelectVehicle = `SELECT a.VehicleId, a.VehiclePlate, a.VehicleTypeId, b.VehicleType,
      a.ShipperId, c.Shipper, a.Active
      FROM MasterVehicle a
      LEFT JOIN MasterVehicleType b on a.VehicleTypeId = b.VehicleTypeId
      LEFT JOIN MasterShipper c on a.ShipperId = c.ShipperId
      WHERE a.Active != 2
      ORDER BY
          CASE WHEN a.ItemNo IS NULL THEN 1 ELSE 0 END ASC,
          a.ItemNo ASC
      `;
    // ORDER BY
    //     CASE WHEN ItemNo IS NULL THEN 1 ELSE 0 END ASC,
    //     ItemNo ASC
    let pool = await sql.connect(dbconfig);
    let Vehicles = await pool.request().query(SelectVehicle);
    res.status(200).send(JSON.stringify(Vehicles.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.use(isAuthEdit("vehicleSetting"));

router.post("/import", importDatabase, (req, res, next) => {
  res.status(201).send({ message: req.message });
});

router.post(
  "/",
  validate(shipperValidator),
  addShipper,
  validate(vehicleTypeValidator),
  addVehicleType,
  validate(vehicleValidator),
  addVehicle,
  (req, res, next) => {
    if (req.result == "dup") return next(createHttpError(400, req.message));
    res.status(201).send({ message: req.message });
  }
);

router.put(
  "/:VehicleId",
  validate(shipperValidator),
  addShipper,
  validate(vehicleTypeValidator),
  addVehicleType,
  validate(vehicleValidator),
  editVehicle,
  (req, res, next) => {
    if (req.result == "dup") return next(createHttpError(400, req.message));
    res.status(200).send({ message: req.message });
  }
);

router.put("/:VehicleId/deactivate", async (req, res, next) => {
  try {
    let { VehicleId } = req.params;
    await activate(0, "MasterVehicle", `VehicleId = ${VehicleId}`);
    res.status(200).send({ message: `ปิดการใช้งานข้อมูลทะเบียนรถสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

router.put("/:VehicleId/activate", async (req, res, next) => {
  try {
    let { VehicleId } = req.params;
    await activate(1, "MasterVehicle", `VehicleId = ${VehicleId}`);
    res.status(200).send({ message: `เปิดการใช้งานข้อมูลทะเบียนรถสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

// ! Deprecated
router.delete("/:VehicleId", async (req, res, next) => {
  try {
    let { VehicleId } = req.params;
    const pool = await sql.connect(dbconfig);
    await pool.request().query(
      `DELETE FROM MasterVehicle
        WHERE VehicleId = ${VehicleId}`
    );
    res.status(200).send({ message: `ลบข้อมูลทะเบียนรถสำเร็จ` });
  } catch (err) {
    next(createHttpError(500, err));
  }
});

module.exports = router;
