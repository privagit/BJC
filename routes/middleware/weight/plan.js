const sql = require("mssql");
const { z } = require("zod");
const dbconfig = require("../../../dbconfig");
const { genNo, insertPlan, insertCard, readExcel, checkRow, getWeightCard } = require("../../modules/weight");
const { uploadPlan } = require("../../modules/uploadFile");
const createHttpError = require("http-errors");

const planValidator = {
  schema: z.object({
    body: z.object({
      PlanDate: z.string().min(1),
      WeightType: z.number(),
      CustomerId: z.number(),
      VehicleId: z.number(),
      TrailerPlate: z.string(),
      DriverName: z.string(),
      Remark: z.string(),
      ThaiMolassesNo: z.string(),
    }),
  }),
  message: "กรุณากรอกวันที่และประเภทการชั่ง",
};

const checkinValidator = {
  schema: z.object({
    body: z.object({
      CheckDate: z.string().min(1),
      CustomerId: z.number(),
      VehicleId: z.number(),
      TrailerPlate: z.string(),
      DriverName: z.string().min(1),
    }),
  }),
  message: "กรุณากรอกวันที่และชื่อพนักงานขับรถ",
};

const importPlan = async (req, res, next) => {
  try {
    const { UserId } = req.session;
    const planFile = await uploadPlan(req, res);
    const plans = await readExcel(planFile);
    const pool = await sql.connect(dbconfig);
    let errArr = [],
      no = 0;
    for (let i = 0; i < plans.length; i++) {
      if (i == 0) continue;
      if (!plans[i][0]) continue;
      if (plans[i][0] != no) {
        no = plans[i][0];
        err = await checkRow(plans[i], "plan");
        errArr = [...errArr, ...err];
      } else {
        err = await checkRow(plans[i], "product");
        errArr = [...errArr, ...err];
      }
    }
    if (errArr.length > 0) return next(createHttpError(400, { message: errArr }));
    // console.log(planArr)
    let n = 0,
      planId;
    console.log(UserId);

    for (let i = 0; i < plans.length; i++) {
      if (i === 0) continue;
      if (!plans[i][0]) continue;
      if (n != plans[i][0]) {
        n = plans[i][0];

        planId = await insertPlan(pool, plans[i], UserId);
        console.log(planId);
      } else {
        console.log(planId);
        await insertCard(pool, plans[i], planId);
      }
    }
    // await Promise.all(
    //   plans.map(async (plan, i) => {
    //     if (i === 0) return;
    //     if (n != plan[0]) {
    //       n = plan[0];

    //       planId = await insertPlan(pool, plan, UserId);
    //       console.log(planId);
    //     } else {
    //       console.log(planId);
    //       await insertCard(pool, plan, planId);
    //     }
    //   })
    // );
    req.message = "นำเข้าแผนสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const addPlan = async (req, res, next) => {
  try {
    const { UserId } = req.session;
    const { PlanDate, WeightType, CustomerId, VehicleId, TrailerPlate, DriverName, Remark, ThaiMolassesNo, MolassesSellerId } = req.body;

    const pool = await sql.connect(dbconfig);
    const PlanNo = await genNo("Plan", PlanDate);
    const plan = await pool.request().query(
      `INSERT INTO WeightPlan(PlanNo,PlanDate,WeightType,CustomerId,VehicleId,
        TrailerPlate,DriverName,Remark,ThaiMolassesNo,MolassesSellerId,CreatedBy)
      VALUES  (N'${PlanNo}', N'${PlanDate}', ${WeightType}, ${CustomerId},
        ${VehicleId}, N'${TrailerPlate}', N'${DriverName}', N'${Remark}',
        N'${ThaiMolassesNo}',${MolassesSellerId || null},${UserId})
      SELECT SCOPE_IDENTITY() as id;`
    );
    req.body.PlanId = plan.recordset[0].id;
    req.result = "ok";
    req.message = "เพิ่มแผนการชั่งสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const editPlan = async (req, res, next) => {
  try {
    const { PlanId } = req.params;
    const { UserId } = req.session;
    const { PlanDate, WeightType, CustomerId, VehicleId, TrailerPlate, DriverName, Remark, ThaiMolassesNo, MolassesSellerId } = req.body;

    const pool = await sql.connect(dbconfig);
    await pool.request().query(
      `UPDATE WeightPlan
      SET PlanDate = N'${PlanDate}', WeightType = ${WeightType},
        CustomerId = ${CustomerId}, VehicleId = ${VehicleId},
        TrailerPlate = N'${TrailerPlate}', DriverName = N'${DriverName}',
        Remark = N'${Remark}', ThaiMolassesNo = N'${ThaiMolassesNo}',
        MolassesSellerId = ${MolassesSellerId}, CreatedBy = ${UserId}
      WHERE PlanId = ${PlanId}`
    );
    req.result = "ok";
    req.message = "แก้ไขแผนการชั่งสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const checkinPlan = async (req, res, next) => {
  try {
    const { PlanId } = req.params;
    const { UserId } = req.session;
    const { CheckDate, CustomerId, VehicleId, TrailerPlate, DriverName } = req.body;

    console.log(UserId);
    const pool = await sql.connect(dbconfig);
    const checkin = await pool.request().query(
      `INSERT INTO WeightPlanCheck(PlanId,CheckDate,CustomerId,VehicleId,TrailerPlate,DriverName,CheckBy)
      VALUES  (${PlanId}, N'${CheckDate}', ${CustomerId}, ${VehicleId},
        N'${TrailerPlate}', N'${DriverName}', ${UserId})
      SELECT SCOPE_IDENTITY() as id;`
    );
    req.body.PlanCheckId = checkin.recordset[0].id;
    req.result = "ok";
    req.message = "ลงชื่อแผนการชั่งสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const addCard = async (req, res, next) => {
  try {
    const { PlanId } = req.params;
    const { ProductId, BillNo, BillWeight } = req.body;

    const pool = await sql.connect(dbconfig);
    const card = await pool.request().query(
      `INSERT INTO WeightCard(PlanId,ProductId,BillNo,BillWeight)
      VALUES  (N'${PlanId}',N'${ProductId}',N'${BillNo}',${BillWeight})
      SELECT SCOPE_IDENTITY() as id;`
    );
    req.body.CardId = card.recordset[0].id;
    req.result = "ok";
    req.message = "เพิ่มสินค้าสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const editCard = async (req, res, next) => {
  try {
    const { CardId } = req.params;
    const { BillNo, BillWeight, AdjWeight, Remark } = req.body;
    const pool = await sql.connect(dbconfig);
    const WeightCard = await pool.request().query(getWeightCard(CardId));
    let { WeightIn, WeightOut } = WeightCard.recordset[0];

    const NewNetWeight = Math.abs(WeightOut - WeightIn) + AdjWeight;
    const NewDifWeight = BillWeight ? BillWeight - NewNetWeight : 0;
    await pool.request().query(`
      UPDATE WeightCard
      SET BillNo = N'${BillNo}', BillWeight = ${BillWeight},
        AdjWeight = ${AdjWeight}, Remark = N'${Remark}',
        NetWeight = ${NewNetWeight}, DifWeight = ${NewDifWeight}
      WHERE CardId = ${CardId}`);
    req.result = "ok";
    req.message = "แก้ไขข้อมูลสินค้าสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

const editSugarReport = async (req, res, next) => {
  try {
    const { CardId } = req.params;
    const { Batch, ReceiveBy, Barrel, Sweetness, Brix, SpecificGravity, Temperature } = req.body;

    const pool = await sql.connect(dbconfig);
    await pool.request().query(`
      UPDATE WeightCard
      SET Batch = N'${Batch}', ReceiveBy = N'${ReceiveBy}',
        Barrel = N'${Barrel}', Sweetness = ${Sweetness},
        Brix = ${Brix}, SpecificGravity = ${SpecificGravity},
        Temperature = ${Temperature}
      WHERE CardId = ${CardId}`);
    req.result = "ok";
    req.message = "แก้ไขผลวิเคราะห์กากน้ำตาลสำเร็จ";
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  planValidator,
  checkinValidator,
  importPlan,
  addPlan,
  editPlan,
  checkinPlan,
  addCard,
  editCard,
  editSugarReport,
};
