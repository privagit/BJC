const sql = require("mssql");
const { z } = require("zod");
const dbconfig = require("../../../dbconfig");
const { checkDup } = require("../../modules/sqlUtils");

const productTypeValidator = {
  schema: z.object({
    body: z.object({
      ProductType: z.string().min(1),
    }),
  }),
  message: "กรุณากรอกชื่อประเภทสินค้า",
};

const productValidator = {
  schema: z.object({
    body: z.object({
      ProductTypeId: z.number(),
      ProductCode: z.string().min(1),
      Product: z.string().min(1),
    }),
  }),
  message: "กรุณากรอกรหัสและชื่อสินค้า",
};

const addProductType = async (req, res, next) => {
  try {
    // if have product type, skip this
    if (req.body.ProductTypeId) return next();
    const { ProductType } = req.body;
    const dupId = await checkDup("ProductTypeId", "MasterProductType", `ProductType = N'${ProductType}' AND Active != 2`);
    if (dupId) {
      req.body.ProductTypeId = dupId;
      req.result = "dup";
      req.message = "ชื่อประเภทสินค้าซ้ำ";
      return next();
    }

    const pool = await sql.connect(dbconfig);
    const productType = await pool.request().query(
      `INSERT INTO MasterProductType(ProductType)
      VALUES  (N'${ProductType}')
      SELECT SCOPE_IDENTITY() as id;`
    );
    req.body.ProductTypeId = productType.recordset[0].id;
    req.result = "ok";
    req.message = "เพิ่มข้อมูลประเภทสินค้าสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const editProductType = async (req, res, next) => {
  try {
    const { ProductTypeId } = req.params;
    const { ProductType } = req.body;

    const dupId = await checkDup(
      "ProductTypeId",
      "MasterProductType",
      `ProductType = N'${ProductType}' AND NOT ProductTypeId = ${ProductTypeId} AND Active != 2`
    );
    if (dupId) {
      req.body.ProductTypeId = dupId;
      req.result = "dup";
      req.message = "ชื่อประเภทสินค้าซ้ำ";
      return next();
    }

    const pool = await sql.connect(dbconfig);
    //* ซ่อนข้อมูลก่อนแก้ไข
    await pool.request().query(`
      UPDATE MasterProductType
      SET Active = 2
      WHERE ProductTypeId = ${ProductTypeId}`);
    const bef_ProductType = await pool.request().query(`SELECT * FROM MasterProductType WHERE ProductTypeId = ${ProductTypeId}`);
    const ItemNo = bef_ProductType.recordset[0].ItemNo ? bef_ProductType.recordset[0].ItemNo : ProductTypeId;
    const updateItemNo = bef_ProductType.recordset[0].ItemNo
      ? ""
      : `UPDATE MasterProductType SET ItemNo = ${ProductTypeId} WHERE ProductTypeId = ${ProductTypeId}`;
    const InsertProduct = `
      ${updateItemNo}
      INSERT INTO MasterProductType(ProductType,ItemNo)
      VALUES  (N'${ProductType}',${ItemNo})
    `;
    await pool.request().query(InsertProduct);
    req.result = "ok";
    req.message = "แก้ไขข้อมูลประเภทสินค้าสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const addProduct = async (req, res, next) => {
  try {
    // if have product, skip this
    if (req.body.ProductId) return next();
    const { ProductCode, Product, ProductTypeId, Price, Weight, Remark } = req.body;
    const pool = await sql.connect(dbconfig);
    const dupId = await checkDup("ProductId", "MasterProduct", `(ProductCode = N'${ProductCode}' OR Product = N'${Product}') AND Active != 2`);
    if (dupId) {
      req.body.ProductId = dupId;
      req.result = "dup";
      req.message = "รหัสหรือชื่อสินค้าซ้ำ";
      return next();
    }

    const product = await pool.request().query(
      `INSERT INTO MasterProduct(ProductCode,Product,ProductTypeId,Price,Weight,Remark)
      VALUES  (N'${ProductCode}',N'${Product}',${ProductTypeId},${Price},${Weight},N'${Remark}')
      SELECT SCOPE_IDENTITY() as id;`
    );
    req.body.ProductId = product.recordset[0].id;
    req.result = "ok";
    req.message = "เพิ่มข้อมูลสินค้าสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const editProduct = async (req, res, next) => {
  try {
    let { ProductId } = req.params;
    let { ProductCode, Product, ProductTypeId, Price, Weight, Remark } = req.body;

    const pool = await sql.connect(dbconfig);
    const dupId = await checkDup(
      "ProductId",
      "MasterProduct",
      `(ProductCode = N'${ProductCode}' OR Product = N'${Product}') AND NOT ProductId = ${ProductId} AND Active != 2`
    );
    if (dupId) {
      req.body.ProductTypeId = dupId;
      req.result = "dup";
      req.message = "รหัสหรือชื่อสินค้าซ้ำ";
      return next();
    }

    //* ซ่อนข้อมูลก่อนแก้ไข
    await pool.request().query(`
      UPDATE MasterProduct
      SET Active = 2
      WHERE ProductId = ${ProductId}`);
    const bef_Product = await pool.request().query(`SELECT * FROM MasterProduct WHERE ProductId = ${ProductId}`);
    const ItemNo = bef_Product.recordset[0].ItemNo ? bef_Product.recordset[0].ItemNo : ProductId;
    const updateItemNo = bef_Product.recordset[0].ItemNo ? "" : `UPDATE MasterProduct SET ItemNo = ${ProductId} WHERE ProductId = ${ProductId}`;
    const InsertProduct = `
        ${updateItemNo}
        INSERT INTO MasterProduct(ProductCode, Product, ProductTypeId, Price, Weight, Remark,ItemNo)
        VALUES  (N'${ProductCode}',N'${Product}',${ProductTypeId},${Price},${Weight},N'${Remark}',${ItemNo})
    `;
    await pool.request().query(InsertProduct);
    req.result = "ok";
    req.message = "แก้ไขข้อมูลสินค้าสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  productTypeValidator,
  productValidator,
  addProductType,
  editProductType,
  addProduct,
  editProduct,
};
