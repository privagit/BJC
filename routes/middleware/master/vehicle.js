const sql = require("mssql");
const { z } = require("zod");
const dbconfig = require("../../../dbconfig");
const { checkDup } = require("../../modules/sqlUtils");

const shipperValidator = {
  schema: z.object({
    body: z.object({
      Shipper: z.string().min(1),
    }),
  }),
  message: "กรุณากรอกชื่อบริษัทขนส่ง",
};
const vehicleTypeValidator = {
  schema: z.object({
    body: z.object({
      VehicleType: z.string().min(1),
    }),
  }),
  message: "กรุณากรอกชื่อประเภทรถ",
};
const vehicleValidator = {
  schema: z.object({
    body: z.object({
      ShipperId: z.number().nullable(),
      VehicleTypeId: z.number().nullable(),
      VehiclePlate: z.string().min(1),
    }),
  }),
  message: "กรุณากรอกประเภทรถ, บริษัทขนส่ง, ป้ายทะเบียนรถ",
};

const addShipper = async (req, res, next) => {
  try {
    // if have shipper, skip
    if (req.body.ShipperId) return next();
    const { Shipper } = req.body;
    const dupId = await checkDup("ShipperId", "MasterShipper", `Shipper = N'${Shipper}' AND Active != 2`);
    if (dupId) {
      req.body.ShipperId = dupId;
      req.result = "dup";
      req.message = "ชื่อบริษัทขนส่งซ้ำ";
      return next();
    }

    const pool = await sql.connect(dbconfig);
    const shipper = await pool.request().query(
      `INSERT INTO MasterShipper(Shipper)
      VALUES  (N'${Shipper}')
      SELECT SCOPE_IDENTITY() as id;`
    );
    req.body.ShipperId = shipper.recordset[0].id;
    req.result = "ok";
    req.message = "เพิ่มข้อมูลบริษัทขนส่งสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const editShipper = async (req, res, next) => {
  try {
    const { ShipperId } = req.params;
    const { Shipper } = req.body;

    const dupId = await checkDup("ShipperId", "MasterShipper", `Shipper = N'${Shipper}' AND NOT ShipperId = ${ShipperId} AND Active != 2`);
    if (dupId) {
      req.body.ShipperId = dupId;
      req.result = "dup";
      req.message = "ชื่อบริษัทขนส่งซ้ำ";
      return next();
    }

    const pool = await sql.connect(dbconfig);
    // await pool.request().query(
    //   `UPDATE MasterShipper
    //   SET Shipper = N'${Shipper}'
    //   WHERE ShipperId = ${ShipperId}`
    // );
    //* ซ่อนข้อมูลก่อนแก้ไข
    await pool.request().query(`
      UPDATE MasterShipper
      SET Active = 2
      WHERE ShipperId = ${ShipperId}`);
    const bef_Shipper = await pool.request().query(`SELECT * FROM MasterShipper WHERE ShipperId = ${ShipperId}`);
    const ItemNo = bef_Shipper.recordset[0].ItemNo ? bef_Shipper.recordset[0].ItemNo : ShipperId;
    const updateItemNo = bef_Shipper.recordset[0].ItemNo ? "" : `UPDATE MasterShipper SET ItemNo = ${ShipperId} WHERE ShipperId = ${ShipperId}`;
    const InsertShipper = `
        ${updateItemNo}
        INSERT INTO MasterShipper(Shipper,ItemNo)
        VALUES  (N'${Shipper}',${ItemNo})
    `;
    await pool.request().query(InsertShipper);
    req.result = "ok";
    req.message = "แก้ไขข้อมูลบริษัทขนส่งสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const addVehicleType = async (req, res, next) => {
  try {
    // if have vehicle type, skip this

    if (req.body.VehicleTypeId) return next();
    const { VehicleType } = req.body;
    const pool = await sql.connect(dbconfig);
    const dupId = await checkDup("VehicleTypeId", "MasterVehicleType", `VehicleType = N'${VehicleType}' AND Active != 2`);
    if (dupId) {
      req.body.VehicleTypeId = dupId;
      req.result = "dup";
      req.message = "ชื่อประเภทรถซ้ำ";
      return next();
    }

    const vehicleType = await pool.request().query(
      `INSERT INTO MasterVehicleType(VehicleType)
      VALUES  (N'${VehicleType}')
      SELECT SCOPE_IDENTITY() as id;`
    );
    req.body.VehicleTypeId = vehicleType.recordset[0].id;
    req.result = "ok";
    req.message = "เพิ่มข้อมูลประเภทรถสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const editVehicleType = async (req, res, next) => {
  try {
    const { VehicleTypeId } = req.params;
    const { VehicleType } = req.body;

    const pool = await sql.connect(dbconfig);
    const dupId = await checkDup(
      "VehicleTypeId",
      "MasterVehicleType",
      `VehicleType = N'${VehicleType}' AND NOT VehicleTypeId = ${VehicleTypeId} AND Active != 2`
    );
    if (dupId) {
      req.body.VehicleTypeId = dupId;
      req.result = "dup";
      req.message = "ชื่อประเภทรถซ้ำ";
      return next();
    }

    // await pool.request().query(
    //   `UPDATE MasterVehicleType
    //   SET VehicleType = N'${VehicleType}'
    //   WHERE VehicleTypeId = ${VehicleTypeId}`
    // );

    //* ซ่อนข้อมูลก่อนแก้ไข
    await pool.request().query(`
      UPDATE MasterVehicleType
      SET Active = 2
      WHERE VehicleTypeId = ${VehicleTypeId}`);
    const bef_VehicleType = await pool.request().query(`SELECT * FROM MasterVehicleType WHERE VehicleTypeId = ${VehicleTypeId}`);
    const ItemNo = bef_VehicleType.recordset[0].ItemNo ? bef_VehicleType.recordset[0].ItemNo : VehicleTypeId;
    const updateItemNo = bef_VehicleType.recordset[0].ItemNo
      ? ""
      : `UPDATE MasterVehicleType SET ItemNo = ${VehicleTypeId} WHERE VehicleTypeId = ${VehicleTypeId}`;
    const InsertVehicleType = `
        ${updateItemNo}
        INSERT INTO MasterVehicleType(VehicleType,ItemNo)
        VALUES  (N'${VehicleType}',${ItemNo})
    `;
    await pool.request().query(InsertVehicleType);
    req.result = "ok";
    req.message = "แก้ไขข้อมูลประเภทรถสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const addVehicle = async (req, res, next) => {
  try {
    // if have vehicle, skip this

    if (req.body.VehicleId) return next();
    const { VehiclePlate, VehicleTypeId, ShipperId } = req.body;
    const pool = await sql.connect(dbconfig);
    const dupId = await checkDup("VehicleId", "MasterVehicle", `VehiclePlate = N'${VehiclePlate}' AND Active != 2`);
    if (dupId) {
      req.body.VehicleTypeId = dupId;
      req.result = "dup";
      req.message = "ทะเบียนรถซ้ำ";
      return next();
    }

    const vehicle = await pool.request().query(
      `INSERT INTO MasterVehicle(VehiclePlate,VehicleTypeId,ShipperId)
      VALUES  (N'${VehiclePlate}',${VehicleTypeId || null},${ShipperId || null})
      SELECT SCOPE_IDENTITY() as id;`
    );
    req.body.VehicleId = vehicle.recordset[0].id;
    req.result = "ok";
    req.message = "เพิ่มข้อมูลทะเบียนรถสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const editVehicle = async (req, res, next) => {
  try {
    const { VehicleId } = req.params;
    const { VehiclePlate, VehicleTypeId, ShipperId } = req.body;

    const pool = await sql.connect(dbconfig);
    const dupId = await checkDup("VehicleId", "MasterVehicle", `VehiclePlate = N'${VehiclePlate}' AND NOT VehicleId = ${VehicleId} AND Active != 2`);
    if (dupId) {
      req.body.VehicleId = dupId;
      req.result = "dup";
      req.message = "ทะเบียนรถซ้ำ";
      return next();
    }
    // await pool.request().query(
    //   `UPDATE MasterVehicle
    //   SET VehiclePlate = N'${VehiclePlate}',
    //     VehicleTypeId = ${VehicleTypeId || null},
    //     ShipperId = ${ShipperId || null}
    //   WHERE VehicleId = ${VehicleId}`
    // );

    //* ซ่อนข้อมูลก่อนแก้ไข
    await pool.request().query(`
      UPDATE MasterVehicle
      SET Active = 2
      WHERE VehicleId = ${VehicleId}`);
    const bef_Vehicle = await pool.request().query(`SELECT * FROM MasterVehicle WHERE VehicleId = ${VehicleId}`);
    const ItemNo = bef_Vehicle.recordset[0].ItemNo ? bef_Vehicle.recordset[0].ItemNo : VehicleId;
    const updateItemNo = bef_Vehicle.recordset[0].ItemNo ? "" : `UPDATE MasterVehicle SET ItemNo = ${VehicleId} WHERE VehicleId = ${VehicleId}`;
    const InsertVehicle = `
        ${updateItemNo}
        INSERT INTO MasterVehicle(VehiclePlate,VehicleTypeId,ShipperId,ItemNo)
        VALUES  (N'${VehiclePlate}',${VehicleTypeId || null},${ShipperId || null},${ItemNo})
    `;
    await pool.request().query(InsertVehicle);
    req.result = "ok";
    req.message = "แก้ไขข้อมูลทะเบียนรถสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addShipper,
  editShipper,
  addVehicleType,
  editVehicleType,
  addVehicle,
  editVehicle,
  shipperValidator,
  vehicleTypeValidator,
  vehicleValidator,
};
