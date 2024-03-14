const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbconfig = require("../../dbconfig");

const validate = require("../middleware/validate");
const { customerValidator, addCustomer } = require("../middleware/master/customer");
const { shipperValidator, vehicleTypeValidator, vehicleValidator, addShipper, addVehicleType, addVehicle } = require("../middleware/master/vehicle");
const { productTypeValidator, productValidator, addProductType, addProduct } = require("../middleware/master/product");
const { planValidator, checkinValidator, addPlan, editPlan, checkinPlan, addCard, importPlan } = require("../middleware/weight/plan");
const { changeStatus, getWeightPlans, getWeightPlanCards, getWeightPlan, getActiveWeightPlanCards, getWeightPlanById } = require("../modules/weight");
const { uploadPlan } = require("../modules/uploadFile");
const createHttpError = require("http-errors");
const { sellerValidator, addMolassesSeller } = require("../middleware/master/seller");
const { isAuthEdit } = require("../middleware/checkUser");

const path = require("path");
const fs = require("fs");
const pdfMake = require("pdfmake");

const { fonts, Layout, createQrCard } = require("../modules/QrCardTemplate");

// All Plan
router.get("/list", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Plan = await pool.request().query(getWeightPlans());
    res.status(200).send(JSON.stringify(Plan.recordset));
  } catch (err) {
    next(err);
  }
});

// One Plan
router.get("/:PlanId", async (req, res, next) => {
  try {
    const { PlanId } = req.params;
    const pool = await sql.connect(dbconfig);
    const Plan = await pool.request().query(getWeightPlanById(PlanId));
    res.status(200).send(JSON.stringify(Plan.recordset));
  } catch (err) {
    next(err);
  }
});

// Plan Product (Card)
router.get("/:PlanId/products", async (req, res, next) => {
  try {
    const { PlanId } = req.params;
    const pool = await sql.connect(dbconfig);
    const Plan = await pool.request().query(getWeightPlanCards(PlanId));
    res.status(200).send(JSON.stringify(Plan.recordset));
  } catch (err) {
    next(err);
  }
});

// Get QrCode
router.get("/:PlanId/qrcode", async (req, res, next) => {
  try {
    let { PlanId } = req.params;
    let pool = await sql.connect(dbconfig);
    const plan = await pool.request().query(getWeightPlan(PlanId));
    console.log(plan.recordset[0]);
    const cards = await pool.request().query(getActiveWeightPlanCards(PlanId));
    if (cards.recordset.length == 0) return res.status(400).send({ message: `ไม่มีแผนการชั่งสินค้า` });
    let FileName = `QR_${plan.recordset[0].PlanNo}`;
    let QrCodePdf = await createQrCard(plan.recordset[0], cards.recordset);
    // const plan = {
    //   PlanNo: '20231112001',
    //   Customer: 'กากน้ำตาล จำกัด',
    //   Shipper: 'ขนส่งทั่วไทย จำกัด',
    //   VehiclePlate: 'กท 11-1111',
    //   TrailerPlate: 'กท 99-9999',
    //   DriverName: 'นายสมชาย อารมณ์ดี',
    //   WeightType: 1,
    // };
    // const cards = [
    //   { Product: 'สุราขาวตรารวงข้าว 30 ดีกรี 330 ml' },
    //   { Product: 'สุราขาวตรารวงข้าว 30 ดีกรี 625 ml' },
    //   { Product: 'สุราขาวตรารวงข้าว 35 ดีกรี 330 ml' },
    //   { Product: 'สุราขาวตรารวงข้าว 35 ดีกรี 625 ml' },
    // ];
    // let FileName = `QR_${plan.PlanNo}`;
    // let QrCodePdf = await createQrCard(plan, cards);
    let pdfCreator = new pdfMake(fonts);
    // console.log("Creating QrCode....");
    let pdfDoc = pdfCreator.createPdfKitDocument(QrCodePdf, {
      tableLayouts: Layout,
    });
    // console.log("QrCode created");
    let QrCodePath = path.join(process.cwd(), `/public/QrPdf/${FileName}.pdf`);
    // console.log("file creating");
    let creating = pdfDoc.pipe(fs.createWriteStream(QrCodePath));
    pdfDoc.end();
    creating.on("finish", () => {
      // console.log("create file success");
      res.status(200).send({ message: `/QrPdf/${FileName}.pdf` });
    });
    creating.on("error", (err) => {
      console.log(err);
      res.send({ message: `${err}` });
    });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.put(
  "/:PlanId/checkin",
  validate(shipperValidator),
  addShipper,
  validate(vehicleTypeValidator),
  addVehicleType,
  validate(vehicleValidator),
  addVehicle,
  validate(checkinValidator),
  checkinPlan,
  (req, res, next) => res.status(201).send({ message: req.message })
);

router.use(isAuthEdit("weightPlan"));
router.post("/import", importPlan, (req, res, next) => res.status(201).send({ message: req.message }));

router.post(
  "/",
  validate(customerValidator),
  addCustomer,
  validate(shipperValidator),
  addShipper,
  validate(vehicleTypeValidator),
  addVehicleType,
  validate(vehicleValidator),
  addVehicle,
  validate(sellerValidator),
  addMolassesSeller,
  validate(planValidator),
  addPlan,
  (req, res, next) => res.status(201).send({ message: req.message })
);

router.put(
  "/:PlanId",
  validate(customerValidator),
  addCustomer,
  validate(shipperValidator),
  addShipper,
  validate(vehicleTypeValidator),
  addVehicleType,
  validate(vehicleValidator),
  addVehicle,
  validate(sellerValidator),
  addMolassesSeller,
  validate(planValidator),
  editPlan,
  (req, res, next) => res.status(200).send({ message: req.message })
);

router.put("/:PlanId/uncancel", async (req, res, next) => {
  const { PlanId } = req.params;
  await changeStatus("plan", PlanId, 1);
  res.status(200).send({ message: `เปลี่ยนสถานะแผนสำเร็จ` });
});

router.put("/:PlanId/cancel", async (req, res, next) => {
  const { PlanId } = req.params;
  await changeStatus("plan", PlanId, 4);
  res.status(200).send({ message: `ยกเลิกแผนสำเร็จ` });
});

// ! Deprecated
// router.delete("/:PlanId", async (req, res, next) => {
//   try {
//     const { PlanId } = req.params;
//     const pool = await sql.connect(dbconfig);
//     await pool.request().query(`DELETE FROM WeightCard
//       WHERE PlanId = ${PlanId};
//       DELETE FROM WeightPlan
//       WHERE PlanId = ${PlanId};`);
//     res.status(200).send({ message: `ลบแผนสำเร็จ` });
//   } catch (err) {
//     next(err);
//   }
// });

// Plan Product (Card)
router.post("/:PlanId/product", validate(productTypeValidator), addProductType, validate(productValidator), addProduct, addCard, (req, res, next) =>
  res.status(201).send({ message: req.message })
);

router.put("/product/:CardId/uncancel", async (req, res, next) => {
  try {
    const { CardId } = req.params;
    await changeStatus("card", CardId, 1);
    res.status(200).send({ message: `เปลี่ยนสถานะแผนชั่งสินค้าสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

router.put("/product/:CardId/cancel", async (req, res, next) => {
  try {
    const { CardId } = req.params;
    await changeStatus("card", CardId, 4);
    res.status(200).send({ message: `ยกเลิกแผนชั่งสินค้าสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

// // ! Deprecated
// router.delete("/product/:CardId", async (req, res, next) => {
//   try {
//     const { CardId } = req.params;
//     const pool = await sql.connect(dbconfig);
//     await pool.request().query(`DELETE FROM WeightCard
//       WHERE CardId = ${CardId};`);
//     res.status(200).send({ message: `ลบแผนชั่งสินค้าสำเร็จ` });
//   } catch (err) {
//     next(err);
//   }
// });

module.exports = router;
