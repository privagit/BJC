const router = require("express").Router();
const sql = require("mssql");
const dbconfig = require("../../dbconfig");
const createHttpError = require("http-errors");
const { addProductType, editProductType, productTypeValidator } = require("../middleware/master/product");
const validate = require("../middleware/validate");
const { activate } = require("../modules/sqlUtils");
const { isAuthEdit } = require("../middleware/checkUser");

router.get("/", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    let ProductType = await pool.request().query(
      `SELECT row_number() over(order by ItemNo) as 'index',
        ProductTypeId, ProductType, Active
        FROM MasterProductType
        WHERE Active != 2
        ORDER BY
          CASE WHEN ItemNo IS NULL THEN 1 ELSE 0 END ASC,
          ItemNo ASC
      `
    );
    res.status(200).send(JSON.stringify(ProductType.recordset));
  } catch (err) {
    next(err);
  }
});

router.use(isAuthEdit("productSetting"));

router.post("/", validate(productTypeValidator), addProductType, (req, res, next) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(201).send({ message: req.message });
});

router.put("/:ProductTypeId", validate(productTypeValidator), editProductType, (req, res, next) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(200).send({ message: req.message });
});

router.put("/:ProductTypeId/deactivate", async (req, res, next) => {
  try {
    let { ProductTypeId } = req.params;
    await activate(0, "MasterProductType", `ProductTypeId = ${ProductTypeId}`);
    res.status(200).send({ message: `ปิดการใช้งานข้อมูลประเภทสินค้าสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

router.put("/:ProductTypeId/activate", async (req, res, next) => {
  try {
    let { ProductTypeId } = req.params;
    await activate(1, "MasterProductType", `ProductTypeId = ${ProductTypeId}`);
    res.status(200).send({ message: `เปิดการใช้งานข้อมูลประเภทสินค้าสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

// ! Deprecated
router.delete("/:ProductTypeId", async (req, res, next) => {
  try {
    let { ProductTypeId } = req.params;
    const pool = await sql.connect(dbconfig);
    await pool.request().query(
      `DELETE FROM MasterProductType
        WHERE ProductTypeId = ${ProductTypeId}`
    );
    res.status(200).send({ message: `ลบข้อมูลประเภทสินค้าสำเร็จ` });
  } catch (err) {
    next(createHttpError(500, err));
  }
});

module.exports = router;
