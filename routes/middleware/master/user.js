const sql = require("mssql");
const { z } = require("zod");
const dbconfig = require("../../../dbconfig");
const { checkDup } = require("../../modules/sqlUtils");
const { encrypt, encryptName } = require("../../../libs/utils");

const addUserValidator = {
  schema: z.object({
    body: z.object({
      Username: z.string().min(1),
      Password: z.string().min(1),
      FirstName: z.string().min(1),
      LastName: z.string().min(1),
      Department: z.string().min(1),
      Position: z.string().min(1),
      Permission: z.object({
        userSetting: z.number(),
        customerSetting: z.number(),
        productSetting: z.number(),
        vehicleSetting: z.number(),
        factorySetting: z.number(),
        weightCard: z.number(),
        weightPlan: z.number(),
      }),
    }),
  }),
  message: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
};

const editUserValidator = {
  schema: z.object({
    body: z.object({
      Username: z.string().min(1),
      FirstName: z.string().min(1),
      LastName: z.string().min(1),
      Department: z.string().min(1),
      Position: z.string().min(1),
      Permission: z.object({
        userSetting: z.number(),
        customerSetting: z.number(),
        productSetting: z.number(),
        vehicleSetting: z.number(),
        factorySetting: z.number(),
        weightCard: z.number(),
        weightPlan: z.number(),
      }),
    }),
  }),
  message: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
};

const changePassValidator = {
  schema: z.object({
    body: z.object({
      Password: z.string().min(1),
    }),
  }),
  message: "กรุณากรอกรหัสผ่าน",
};

const addUser = async (req, res, next) => {
  try {
    const { Username, Password, FirstName, LastName, Department, Position, Permission } = req.body;
    const dupId = await checkDup("UserId", "Users", `Username = N'${Username}'`);
    if (dupId) {
      req.body.UserId = dupId;
      req.result = "dup";
      req.message = "ชื่อผู้ใช้ซ้ำ";
      return next();
    }

    const pool = await sql.connect(dbconfig);
    const product = await pool.request().query(
      `INSERT INTO Users(Username,Password,FirstName,LastName,Department,Position,Permission)
      VALUES  (N'${Username}',N'${encrypt(Password)}',
        N'${FirstName}',N'${LastName}',
        N'${Department}',N'${Position}',N'${JSON.stringify(Permission)}')
      SELECT SCOPE_IDENTITY() as id;`
    );
    req.body.UserId = product.recordset[0].id;
    req.result = "ok";
    req.message = "เพิ่มผู้ใช้สำเร็จ";
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const editUser = async (req, res, next) => {
  try {
    const { UserId } = req.params;
    const { Username, FirstName, LastName, Department, Position, Permission } = req.body;

    const dupId = await checkDup("UserId", "Users", `Username = N'${Username}' AND NOT UserId = ${UserId}`);
    if (dupId) {
      req.body.UserId = dupId;
      req.result = "dup";
      req.message = "ชื่อผู้ใช้ซ้ำ";
      return next();
    }

    const pool = await sql.connect(dbconfig);
    await pool.request().query(`
      UPDATE Users
      SET Username = N'${Username}',
        FirstName = N'${FirstName}',
        LastName = N'${LastName}',
        Department = N'${Department}',Position = N'${Position}',
        Permission = N'${JSON.stringify(Permission)}'
      WHERE UserId = ${UserId}`);
    req.result = "ok";
    req.message = "แก้ไขผู้ใช้สำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const changePass = async (req, res, next) => {
  try {
    const { UserId } = req.params;
    const { Password } = req.body;

    const pool = await sql.connect(dbconfig);
    await pool.request().query(`
      UPDATE Users
      SET Password = N'${encrypt(Password)}'
      WHERE UserId = ${UserId}`);
    req.result = "ok";
    req.message = "เปลี่ยนรหัสผ่านสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addUserValidator,
  editUserValidator,
  changePassValidator,
  addUser,
  editUser,
  changePass,
};
