const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbconfig = require("../../dbconfig");
const createHttpError = require("http-errors");
const { addProductType, addProduct, editProduct, productValidator, productTypeValidator } = require("../middleware/master/product");
const validate = require("../middleware/validate");
const { activate } = require("../modules/sqlUtils");
const { isAuthEdit } = require("../middleware/checkUser");
const { importDatabase } = require("../middleware/master/import");

router.get("/", async (req, res, next) => {
  try {
    let SelectProduct = `SELECT a.ProductId, a.ProductCode, a.Product, a.ProductTypeId,
      b.ProductType, a.Price, a.Weight, a.Remark, a.Active
      FROM MasterProduct a
      LEFT JOIN MasterProductType b on a.ProductTypeId = b.ProductTypeId
      WHERE a.Active != 2
      ORDER BY
          CASE WHEN ItemNo IS NULL THEN 1 ELSE 0 END ASC,
          ItemNo ASC
      `;
    let pool = await sql.connect(dbconfig);
    let Product = await pool.request().query(SelectProduct);
    res.status(200).send(JSON.stringify(Product.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.use(isAuthEdit("productSetting"));

router.post("/import", importDatabase, (req, res, next) => {
  res.status(201).send({ message: req.message });
});

router.post("/", validate(productTypeValidator), addProductType, validate(productValidator), addProduct, (req, res, next) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(201).send({ message: req.message });
});

router.put("/:ProductId", validate(productTypeValidator), addProductType, validate(productValidator), editProduct, (req, res, next) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(200).send({ message: req.message });
});

router.put("/:ProductId/deactivate", async (req, res, next) => {
  try {
    let { ProductId } = req.params;
    await activate(0, "MasterProduct", `ProductId = ${ProductId}`);
    res.status(200).send({ message: `ปิดการใช้งานข้อมูลสินค้าสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

router.put("/:ProductId/activate", async (req, res, next) => {
  try {
    let { ProductId } = req.params;
    await activate(1, "MasterProduct", `ProductId = ${ProductId}`);
    res.status(200).send({ message: `เปิดการใช้งานข้อมูลสินค้าสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

// ! Deprecated
router.delete("/:ProductId", async (req, res, next) => {
  try {
    let { ProductId } = req.params;
    const pool = await sql.connect(dbconfig);
    await pool.request().query(
      `DELETE FROM MasterProduct
        WHERE ProductId = ${ProductId}`
    );
    res.status(200).send({ message: `ลบข้อมูลสินค้าสำเร็จ` });
  } catch (err) {
    next(createHttpError(500, err));
  }
});

module.exports = router;
