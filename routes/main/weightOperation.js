const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbconfig = require("../../dbconfig");

const { checkDate, checkDateTime, getDateTime } = require("../../libs/date");
const { uploadPlate, copyImg } = require("../modules/uploadFile");
const { genNo, updateWeight, changeStatus, getWeightCard } = require("../modules/weight");
const createHttpError = require("http-errors");
const { checkDup } = require("../modules/sqlUtils");

router.post("/testupimg/:Data", async (req, res) => {
  let Filename = await uploadPlate("O", req, res);
  res.status(200).send({ message: `สำเร็จ` });
});

// Data = { CardId, Weight, WeightDate }
router.post("/:Data", async (req, res, next) => {
  try {
    const { CardId, Weight, WeightDate } = JSON.parse(req.params.Data);
    const pool = await sql.connect(dbconfig);
    const card = await pool.request().query(
      `SELECT PlanId, BillWeight, WeightIn, WeightOut, AdjWeight, Status
      FROM WeightCard 
      WHERE CardId = ${CardId}`
    );
    const { PlanId, WeightIn, WeightOut, BillWeight, AdjWeight, Status } = card.recordset[0];

    // เช็คว่ามีการชั่งหรือยัง
    const checkStatus = await pool.request().query(
      `
      SELECT  CardId, CardNo, PlanId, Status
      FROM CardView
      WHERE PlanId = ${PlanId} AND Status = 2 AND CardId != ${CardId}
      `
    );
    if (checkStatus.recordset.length != 0) {
      return res.status(200).send({ CardId: checkStatus.recordset[0].CardId, Status: 7 }); // ไม่บันทึก
    }
    console.log("normal status");
    if (WeightIn && WeightOut) {
      const Card = await pool.request().query(getWeightCard(CardId));
      console.log("already has weight card:", Card.recordset[0].CardNo);
      return res.status(200).send(Card.recordset[0]);
      // return next(createHttpError(400, `สินค้านี้ชั่งครบแล้ว`)); // ไม่บันทึก
    }
    if (WeightIn) {
      console.log("Weight Out", CardId, Weight, WeightDate);
      // บันทึกน้ำหนักและรูปขาออก
      const NetWeight = Math.abs(Weight - WeightIn) + AdjWeight;
      const DifWeight = BillWeight ? BillWeight - NetWeight : 0;
      const PlateFile = await uploadPlate(req, res);
      await updateWeight("out", {
        ...JSON.parse(req.params.Data),
        ...PlateFile,
        NetWeight,
        DifWeight,
      });

      // change status complete
      const unfinished = await checkDup("CardId", "WeightCard", `WeightOut IS NULL AND PlanId = ${PlanId} AND  NOT CardId = ${CardId}`);
      console.log("unfinished", unfinished);
      if (!unfinished) await changeStatus("plan", PlanId, 3);
      const Card = await pool.request().query(getWeightCard(CardId));
      console.log("weight out card:", Card.recordset[0].CardNo);
      return res.status(200).send(Card.recordset[0]);
    } else {
      // บันทึกน้ำหนักและรูปขาเข้า
      const checkCardNo = await pool.request().query(
        `
        SELECT  CardNo, PlanId
          FROM CardView 
          WHERE PlanId = ${PlanId}
          ORDER By CardNo DESC
        `
      );
      console.log("test check No");
      let CardNo = checkCardNo.recordset[0].CardNo ? checkCardNo.recordset[0].CardNo : await genNo("Card", checkDate());
      // const CardNo = await genNo("Card", checkDate());
      console.log("Weight In", CardId, Weight, WeightDate, CardNo);
      const PlateFile = await uploadPlate(req, res);
      await updateWeight("in", {
        ...JSON.parse(req.params.Data),
        ...PlateFile,
        CardNo,
        PlanId,
      });
      const Card = await pool.request().query(getWeightCard(CardId));
      return res.status(200).send(Card.recordset[0]);
    }
    const Card = await pool.request().query(getWeightCard(CardId));
    res.status(200).send(Card.recordset[0]);
    // res.status(200).send({ message: `ชั่งสำเร็จ` });
  } catch (err) {
    next(err);
  }
});

// ! Deprecated, Use GET /weight/card/:CardId instead
// get product list from vehicle plate, customer code, weight type, date
router.get("/product_list/:Data", async (req, res) => {
  try {
    let { QRCode, WeightType } = JSON.parse(req.params.Data);
    console.log(JSON.parse(req.params.Data));
    let pool = await sql.connect(dbconfig);
    // เช็คทะเบียนรถและลูกค้าว่ามีมั้ย
    let VC = await pool.request().query(
      `SELECT a.VehicleId, c.VehiclePlate, a.CustomerId,
        b.CustomerType, b.CustomerName
        FROM MasterVehicleCustomer a
        LEFT JOIN MasterCustomer b on a.CustomerId = b.CustomerId
        LEFT JOIN MasterVehicle c on a.VehicleId = c.VehicleId
        WHERE VehicleCustomerId = ${QRCode}`
    );
    if (!VC.recordset.length) {
      res.status(401).send({ message: `ไม่พบคิวอาร์โค้ด` });
      return;
    }
    let { VehicleId, VehiclePlate, CustomerId, CustomerType, CustomerName } = VC.recordset[0];
    if (CustomerType == 1) {
      // ลูกค้ารายใหญ่
      // เลือกแผนที่กำลังทำอยู่ ถ้ามี
      let SelectPresentPlan = `SELECT PlanId, PlanStatus FROM WeightPlan
        WHERE VehicleId = ${VehicleId} AND CustomerId = ${CustomerId} AND PlanDate = N'${checkDate()}' AND WeightType = N'${WeightType}' AND PlanStatus = 2`;
      let Plans = await pool.request().query(SelectPresentPlan);
      if (!Plans.recordset.length) {
        let SelectPlans = `SELECT PlanId, PlanStatus FROM WeightPlan
          WHERE VehicleId = ${VehicleId} AND CustomerId = ${CustomerId} AND PlanDate = N'${checkDate()}' AND WeightType = N'${WeightType}'`;
        Plans = await pool.request().query(SelectPlans);
        if (!Plans.recordset.length) {
          res.status(404).send({ message: `ไม่พบแผน` });
          return;
        }
      }
      let PlanList = {
        Infomation: { VehiclePlate, CustomerName, WeightType },
      };
      // ดูรายการแผนที่ตรงเงื่อนไข
      let PlanArr = [];
      for (let Plan of Plans.recordset) {
        let ProductArr = [];
        let { PlanId, PlanStatus } = Plan;
        if (PlanStatus == 4) continue;
        let SelectProducts = `SELECT a.PlanProductId, a.PlanProductStatus, a.BillWeight, b.ProductName FROM WeightPlanProduct a
          LEFT JOIN MasterProduct b on a.ProductId = b.ProductId
          WHERE PlanId = ${PlanId}`;
        let Products = await pool.request().query(SelectProducts);
        if (!Products.recordset.length) continue;
        // รายการสินค้าในแต่ละแผน
        for (let Product of Products.recordset) {
          let { PlanProductId, PlanProductStatus, BillWeight, ProductName } = Product;
          if (PlanProductStatus != 1) continue;
          let ProductPush = {
            PlanProductId,
            ProductName,
            PlanProductStatus,
            BillWeight,
          };
          ProductArr.push(ProductPush);
        }
        let ProductList = { Product: ProductArr };
        if (Object.keys(ProductList).length) PlanArr.push(ProductList);
      }
      if (PlanArr.length) PlanList["Plan"] = PlanArr;
      if (!PlanList.Plan) {
        res.status(200).send({ message: `สินค้าครบแล้ว` });
      } else {
        console.log(PlanList);
        res.status(200).send(PlanList);
      }
    } else {
      // ลูกค้ารายย่อย
      let SelectPlans = `SELECT PlanId, PlanStatus FROM WeightPlan
          WHERE VehicleId = ${VehicleId} AND CustomerId = ${CustomerId} AND PlanDate = N'${checkDate()}' AND WeightType = N'${WeightType}' AND PlanStatus = 2`;
      let Plans = await pool.request().query(SelectPlans);
      if (!Plans.recordset.length) {
        // ไม่มีแผนที่กำลังทำค้างไว้่ สร้างแผนใหม่
        let SelectProducts = `SELECT ProductId, ProductName, ProductWeight FROM MasterProduct`;
        let Products = await pool.request().query(SelectProducts);
        let PlanData = {
          Infomation: { VehiclePlate, CustomerName, WeightType },
        };
        let ProductList = [{ VehiclePlate, CustomerName, WeightType }];
        // แสดงรายการสินค้าตามที่กำหนด
        for (let Product of Products.recordset) {
          let { ProductId, ProductName, ProductWeight } = Product;
          let ProductPush = {
            ProductId,
            ProductName,
            ProductWeight,
          };
          PlanData["Plan"] = ProductPush;
        }
        console.log(ProductList);
        res.status(200).send(ProductList);
      } else {
        // ทำแผนเดิม ขาออก
        res.status(200).send([{ message: `สินค้าครบแล้ว` }]);
      }
    }
  } catch (err) {
    next(err);
  }
});

// ! Deprecated, Use POST /weight/operation/:Data instead
router.post("/weight/:Data", async (req, res) => {
  try {
    let { ProductId, QRCode, WeightType, WeightDate, Weight } = JSON.parse(req.params.Data);
    console.log(JSON.parse(req.params.Data));
    let pool = await sql.connect(dbconfig);
    // เช็คทะเบียนรถและลูกค้าว่ามีมั้ย
    let VC = await pool.request().query(
      `SELECT a.VehicleId, a.CustomerId, b.CustomerType
        FROM MasterVehicleCustomer a
        LEFT JOIN MasterCustomer b on a.CustomerId = b.CustomerId
        WHERE VehicleCustomerId = ${QRCode}`
    );
    if (!VC.recordset.length) {
      res.status(401).send({ message: `ไม่พบคิวอาร์โค้ด` });
      return;
    }
    let { VehicleId, CustomerId, CustomerType } = VC.recordset[0];
    if (CustomerType == 1) {
      // รายใหญ่
      if (ProductId != "") {
        // กรณียังมีสินค้าต่อไป
        let GetPlanId = `SELECT PlanId FROM WeightPlanProduct
            WHERE PlanProductId = ${ProductId};`;
        let Plan = await pool.request().query(GetPlanId);
        console.log("plan");
        let PlanId = Plan.recordset[0].PlanId;

        // อัปเดทลำดับการชั่งของสินค้า, สถานะของแผน
        let PlanProduct = await pool.request().query(`SELECT COUNT(PlanProductId) weightorder
            FROM WeightPlanProduct
            WHERE NOT PlanProductId = ${ProductId} AND PlanId = ${PlanId} AND NOT PlanProductStatus = 1;
            UPDATE WeightPlan
            SET PlanStatus = 2
            WHERE PlanId = ${PlanId}`);
        let WeightOrder = PlanProduct.recordset[0].weightorder + 1;
        console.log("order", WeightOrder);
        // Generate CardNo
        let WeightCardNo = await genNo("Card", checkDate());
        let UpdateCardNo = `UPDATE WeightCard
          SET WeightCardNo = N'${WeightCardNo}'
          WHERE PlanProductId = ${ProductId};`;
        await pool.request().query(UpdateCardNo);
        console.log(WeightCardNo);
        // บันทึกไฟล์รูปขาเข้า
        let { FrontName, TopName } = await uploadPlate("I", req, res);
        let FrontImgPath = `./Images/Vehicle/${FrontName}`;
        let TopImgPath = `./Images/Vehicle/${TopName}`;
        // อัปเดทน้ำหนักขาเข้าของสินค้า
        let UpdateWeight = `UPDATE WeightCard
          SET WeightInDate=N'${WeightDate}',
          WeightIn=${Weight},
          WeightInFrontImgPath=N'${FrontImgPath}',
          WeightInTopImgPath=N'${TopImgPath}',
          CardStatus = 3
          WHERE PlanProductId = ${ProductId};
          UPDATE WeightPlanProduct
          SET WeightOrder = ${WeightOrder},
          PlanProductStatus = 3
          WHERE PlanProductId = ${ProductId};`;
        await pool.request().query(UpdateWeight);
        console.log("update weight");
        if (WeightOrder != 1) {
          // อัปเดทน้ำหนักขาออกของสินค้าก่อนหน้า ถ้ามี
          let PreWeightOrder = WeightOrder - 1;
          console.log("Preorder", PreWeightOrder);
          let PreCard = await pool.request().query(`SELECT b.PlanProductId
            FROM WeightCard a
            LEFT JOIN WeightPlanProduct b on a.PlanProductId = b.PlanProductId
            WHERE b.PlanId = ${PlanId} AND WeightOrder = ${PreWeightOrder}`);
          console.log(PreCard.recordset[0]);
          let PrePlanProductId = PreCard.recordset[0].PlanProductId;
          console.log("Preplan", PrePlanProductId);
          // บันทึกไฟล์รูปขาออก
          let PreFrontImgname = copyImg(FrontName);
          let PreTopImgname = copyImg(TopName);
          let PreFrontImgPath = `./Images/Vehicle/${PreFrontImgname}`;
          let PreTopImgPath = `./Images/Vehicle/${PreTopImgname}`;
          let UpdatePreWeightOut = `UPDATE WeightCard
            SET
            WeightOutDate=N'${WeightDate}',
            WeightOut=${Weight},
            WeightOutFrontImgPath=N'${PreFrontImgPath}',
            WeightOutTopImgPath=N'${PreTopImgPath}',
            CardStatus = 4
            WHERE PlanProductId = ${PrePlanProductId};
            UPDATE WeightPlanProduct
            SET PlanProductStatus = 4
            WHERE PlanProductId = ${PrePlanProductId};`;
          await pool.request().query(UpdatePreWeightOut);
          //คำนวณ ืืน้ำหนักสุทธิ, ผลต่างน้ำหนัก
          let getWeight = await pool.request().query(`SELECT WeightIn, WeightOut, AdjWeight, BillWeight
              FROM WeightCard a
              WHERE PlanProductId = ${PrePlanProductId}`);
          let { WeightIn, WeightOut, AdjWeight, BillWeight } = getWeight.recordset[0];
          let NetWeight = Math.abs(WeightIn - WeightOut) + AdjWeight;
          let DifWeight;
          BillWeight == 0 ? (DifWeight = 0) : (DifWeight = Math.abs(NetWeight - BillWeight));
          await pool.request().query(`UPDATE WeightCard
            SET NetWeight=${NetWeight},
            DifWeight=${DifWeight}
            WHERE PlanProductId = ${PrePlanProductId}`);
          // ดึงข้อมูลการ์ด
          let getCardData = `SELECT WeightCardNo, WeightType,
            ProductName, CustomerName, VehiclePlate, TrailerPlate,
            BillNo, BillWeight, CardNote,
            FORMAT(WeightInDate, 'yyyy-MM-dd hh:mm:ss') WeightInDate, WeightIn,
            FORMAT(WeightOutDate, 'yyyy-MM-dd hh:mm:ss') WeightOutDate, WeightOut,
            AdjWeight, NetWeight, DifWeight
            FROM WeightCard a
            WHERE PlanProductId = ${PrePlanProductId}`;
          let Card = await pool.request().query([getCardData]);
          res.status(200).send(Card.recordset[0]);
        } else {
          res.status(200).send({ message: `ชั่งสำเร็จ` });
        }
      } else {
        // กรณีสินค้าชิ้นสุดท้ายของแผน
        let getPlanProductId = await pool.request().query(`SELECT a.PlanProductId, a.PlanId
            FROM WeightPlanProduct a
            LEFT JOIN WeightPlan b on a.PlanId = b.PlanId
            WHERE b.VehicleId = ${VehicleId} AND b.CustomerId = ${CustomerId} AND b.PlanDate = N'${checkDate()}' AND b.WeightType = N'${WeightType}' AND b.PlanStatus = 2 AND a.PlanProductStatus = 3`);
        if (!getPlanProductId.recordset.length) {
          res.status(200).send({ message: `สินค้าทำการชั่งครบแล้ว` });
          return;
        }
        let PlanProductId = getPlanProductId.recordset[0].PlanProductId;
        console.log("Planproductid", PlanProductId);
        let PlanId = getPlanProductId.recordset[0].PlanId;
        // ดึงข้อมูลเลขบัตรชั่งของสินค้า
        let getWeightCardNo = await pool.request().query(`SELECT WeightCardNo
            From WeightCard WHERE PlanProductId = ${PlanProductId}`);
        let LastWeightCardNo = getWeightCardNo.recordset[0].WeightCardNo;
        console.log("LastWeightCardNo", LastWeightCardNo);
        // บันทึกไฟล์รูป
        let { FrontName, TopName } = await uploadPlate("O", req, res);
        let FrontImgPath = `./Images/Vehicle/${FrontName}`;
        let TopImgPath = `./Images/Vehicle/${TopName}`;
        // อัปเดทน้ำหนักขาออกของสินค้า
        let UpdateWeight = `UPDATE WeightCard
            SET WeightOutDate=N'${WeightDate}',
            WeightOut=${Weight},
            WeightOutFrontImgPath=N'${FrontImgPath}',
            WeightOutTopImgPath=N'${TopImgPath}',
            CardStatus = 4
            WHERE PlanProductId = ${PlanProductId};
          UPDATE WeightPlanProduct
            SET PlanProductStatus = 4
            WHERE PlanProductId = ${PlanProductId};
          UPDATE WeightPlan
            SET PlanStatus = 4
            WHERE PlanId = ${PlanId};`;
        await pool.request().query(UpdateWeight);
        console.log("update weight");
        //คำนวณ ืืน้ำหนักสุทธิ, ผลต่างน้ำหนัก
        let getWeight = await pool.request().query(`SELECT WeightIn, WeightOut, AdjWeight, BillWeight
            FROM WeightCard a
            WHERE PlanProductId = ${PlanProductId}`);
        let { WeightIn, WeightOut, AdjWeight, BillWeight } = getWeight.recordset[0];
        let NetWeight = Math.abs(WeightIn - WeightOut) + AdjWeight;
        let DifWeight;
        BillWeight == 0 ? (DifWeight = 0) : (DifWeight = Math.abs(NetWeight - BillWeight));
        await pool.request().query(`UPDATE WeightCard
          SET NetWeight=${NetWeight},
          DifWeight=${DifWeight}
          WHERE PlanProductId = ${PlanProductId}`);
        // ดึงข้อมูลการ์ด
        let getCardData = `SELECT WeightCardNo, WeightType,
          ProductName, CustomerName, VehiclePlate, TrailerPlate,
          BillNo, BillWeight, CardNote, WeightInDate, WeightIn,
          WeightOutDate, WeightOut, AdjWeight, NetWeight, DifWeight
          FROM WeightCard a
          WHERE PlanProductId = ${PlanProductId}`;
        let Card = await pool.request().query(getCardData);
        res.status(200).send(Card.recordset[0]);
      }
    } else {
      // รายย่อย
      res.status(200).send(JSON.stringify(Plans.recordset));
    }
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

module.exports = router;
