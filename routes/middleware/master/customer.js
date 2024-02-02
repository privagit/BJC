const sql = require("mssql");
const { z } = require("zod");
const dbconfig = require("../../../dbconfig");
const { checkDup } = require("../../modules/sqlUtils");

const customerValidator = {
  schema: z.object({
    body: z.object({
      CustomerCode: z.string().min(1),
      Customer: z.string().min(1),
    }),
  }),
  message: "กรุณากรอกรหัสและชื่อลูกค้า",
};

const addCustomer = async (req, res, next) => {
  try {
    // if have product, skip this
    if (req.body.CustomerId) return next();
    const { CustomerCode, Customer, Address, Tel, Remark } = req.body;
    const dupId = await checkDup("CustomerId", "MasterCustomer", `(CustomerCode = N'${CustomerCode}' OR Customer = N'${Customer}') AND Active != 2`);
    if (dupId) {
      req.body.CustomerId = dupId;
      req.result = "dup";
      req.message = "รหัสหรือชื่อลูกค้าซ้ำ";
      return next();
    }

    const pool = await sql.connect(dbconfig);
    const product = await pool.request().query(
      `INSERT INTO MasterCustomer(CustomerCode,Customer,Address,Tel,Remark)
      VALUES  (N'${CustomerCode}',N'${Customer}',N'${Address}',N'${Tel}',N'${Remark}')
      SELECT SCOPE_IDENTITY() as id;`
    );
    req.body.CustomerId = product.recordset[0].id;
    req.result = "ok";
    req.message = "เพิ่มข้อมูลลูกค้าสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const editCustomer = async (req, res, next) => {
  try {
    const { CustomerId } = req.params;
    const { CustomerCode, Customer, Address, Tel, Remark } = req.body;

    const dupId = await checkDup(
      "CustomerId",
      "MasterCustomer",
      `(CustomerCode = N'${CustomerCode}' OR Customer = N'${Customer}') AND NOT CustomerId = ${CustomerId} AND Active != 2`
    );
    if (dupId) {
      req.body.CustomerId = dupId;
      req.result = "dup";
      req.message = "รหัสหรือชื่อสินค้าซ้ำ";
      return next();
    }

    const pool = await sql.connect(dbconfig);
    //* ซ่อนข้อมูลก่อนแก้ไข
    await pool.request().query(`
      UPDATE MasterCustomer
      SET Active = 2
      WHERE CustomerId = ${CustomerId}`);
    const bef_Customer = await pool.request().query(`SELECT * FROM MasterCustomer WHERE CustomerId = ${CustomerId}`);
    const ItemNo = bef_Customer.recordset[0].ItemNo ? bef_Customer.recordset[0].ItemNo : CustomerId;
    const updateItemNo = bef_Customer.recordset[0].ItemNo ? "" : `UPDATE MasterCustomer SET ItemNo = ${CustomerId} WHERE CustomerId = ${CustomerId}`;
    const InsertCustomer = `
        ${updateItemNo}
        INSERT INTO MasterCustomer(CustomerCode,Customer,Address,Tel,Remark,ItemNo)
        VALUES  (N'${CustomerCode}',N'${Customer}',N'${Address}',N'${Tel}',N'${Remark}',${ItemNo})
    `;
    await pool.request().query(InsertCustomer);
    req.result = "ok";
    req.message = "แก้ไขข้อมูลสินค้าสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  customerValidator,
  addCustomer,
  editCustomer,
};
