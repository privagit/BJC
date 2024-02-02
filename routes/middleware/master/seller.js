const sql = require("mssql");
const { z } = require("zod");
const dbconfig = require("../../../dbconfig");
const { checkDup } = require("../../modules/sqlUtils");
const createHttpError = require("http-errors");

const sellerValidator = {
  schema: z.object({
    body: z.object({
      ThaiMolassesNo: z.string(),
      MolassesSellerCode: z.string(),
      MolassesSeller: z.string(),
    }),
  }),
  message: "กรุณากรอกรหัสและชื่อผู้ค้ากากน้ำตาล",
};

const addMolassesSeller = async (req, res, next) => {
  try {
    // if have product, skip this
    if (req.body.MolassesSellerId) return next();
    console.log(req.body);
    if (!req.body.ThaiMolassesNo) return next();
    const { MolassesSellerCode, MolassesSeller } = req.body;
    if (!MolassesSellerCode || !MolassesSeller)
      return next(
        createHttpError(400, {
          message: "กรุณากรอกรหัสและชื่อบริษัทผู้ค้ากากน้ำตาล",
        })
      );
    const dupId = await checkDup("CustomerId", "MasterCustomer", `CustomerCode = N'${MolassesSellerCode}' OR Customer = N'${MolassesSeller}'`);
    if (dupId) {
      req.body.MolassesSellerId = dupId;
      req.result = "dup";
      req.message = "รหัสหรือชื่อลูกค้าซ้ำ";
      return next();
    }

    const pool = await sql.connect(dbconfig);
    const product = await pool.request().query(
      `INSERT INTO MasterMolassesSeller(MolassesSellerCode,MolassesSeller)
      VALUES  (N'${MolassesSellerCode}',N'${MolassesSeller}')
      SELECT SCOPE_IDENTITY() as id;`
    );
    req.body.MolassesSellerId = product.recordset[0].id;
    req.result = "ok";
    req.message = "เพิ่มข้อมูลลูกค้าสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sellerValidator,
  addMolassesSeller,
};
