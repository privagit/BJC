const sql = require("mssql");
const dbconfig = require("../../dbconfig");
const XlsxPopulate = require("xlsx-populate");
const { checkDup, checkLen, fromToFilter } = require("./sqlUtils");
const { checkDate } = require("../../libs/date");
const logger = require("../../libs/logger");

const genNo = async (type, date) => {
  const Date = date.replace(/-/g, "");
  const prefix = type === "Card" ? "" : "pl_";
  let No = "";
  let dupNo = true;
  let n =
    type === "Card"
      ? await checkLen("CardId", "WeightCard", `CardNo LIKE N'${Date}%'`)
      : await checkLen("PlanId", "WeightPlan", `PlanNo LIKE N'pl_${Date}%'`);
  do {
    if (n < 10) No = prefix + Date + "000" + n;
    else if (n < 100) No = prefix + Date + "00" + n;
    else if (n < 1000) No = prefix + Date + "0" + n;
    else No = prefix + Date + n;

    dupNo =
      type === "Card" ? await checkDup("PlanId", "WeightPlan", `PlanNo = N'${No}'`) : await checkDup("CardId", "WeightCard", `CardNo = N'${No}'`);
    if (dupNo) n++;
  } while (dupNo);
  logger.debug(`Genarate ${type} No ${No} for ${date}`);
  return No;
};

// 1 Plan / 2 In Progress / 3 Complete / 4 Cancel
const changeStatus = async (type, id, status) => {
  const pool = await sql.connect(dbconfig);
  logger.debug(`${type} ${id} status ${status}`);
  if (type === "plan") {
    const cancelCard = status === 4 ? `UPDATE WeightCard SET Status = ${status} WHERE PlanId = ${id}` : "";
    await pool.request().query(
      `UPDATE WeightPlan
        SET Status = ${status} WHERE PlanId = ${id}; ${cancelCard}`
    );
    return;
  }
  const plan = await pool.request().query(
    `UPDATE WeightCard
        SET Status = ${status} WHERE CardId = ${id};
      SELECT PlanId,Status FROM WeightCard WHERE CardId = ${id}`
  );
  const { PlanId, Status } = plan.recordset[0];
  const cardId = await checkDup("CardId", "WeightCard", `PlanId = ${PlanId} AND NOT Status = ${status}`);
  if (cardId || Status === status) return;
  logger.debug(`plan ${PlanId} status ${status}`);
  if (status === 2 || status === 3) await changeStatus("plan", PlanId, status);
  return;
};

const readExcel = async (file) => {
  const wb = await XlsxPopulate.fromFileAsync(file.path);
  const rows = wb.sheet(0).usedRange().value();
  return rows;
};

const checkRow = (row, type) =>
  new Promise(async (resolve, reject) => {
    let errArr = [];
    if (type == "plan") {
      const checkCustomer = await checkDup("CustomerId", "MasterCustomer", `CustomerCode = N'${row[3]}'`);
      const checkVehicle = await checkDup("VehicleId", "MasterVehicle", `VehiclePlate = N'${row[4]}'`);
      const checkShipper = await checkDup("ShipperId", "MasterShipper", `Shipper = N'${row[5]}'`);
      if (!checkCustomer) errArr.push(`ไม่พบลูกค้า ${row[3]}`);
      if (!checkVehicle) errArr.push(`ไม่พบทะเบียนรถ ${row[4]}`);
      if (!checkShipper) errArr.push(`ไม่พบบริษัทขนส่ง ${row[5]}`);
    }

    const checkProduct = await checkDup("ProductId", "MasterProduct", `ProductCode = N'${row[10]}'`);
    if (!checkProduct) errArr.push(`ไม่พบสินค้า ${row[10]}`);
    resolve(errArr);
  });

const insertPlan = (pool, plan, userId = 2) =>
  new Promise(async (resolve, reject) => {
    const PlanDate = checkDate(XlsxPopulate.numberToDate(plan[1]));
    const PlanNo = await genNo("Plan", PlanDate);
    const WeightType = plan[2] == "ชั่งเข้า" ? 1 : 2;
    const CustomerId = await checkDup("CustomerId", "MasterCustomer", `CustomerCode = N'${plan[3]}'`);
    const VehicleId = await checkDup("VehicleId", "MasterVehicle", `VehiclePlate = N'${plan[4]}'`);
    console.log(`INSERT INTO WeightPlan(PlanNo,PlanDate,WeightType,CustomerId,VehicleId,
      TrailerPlate,DriverName,Remark,ThaiMolassesNo,CreatedBy)
    VALUES  (N'${PlanNo}', N'${PlanDate}', ${WeightType}, ${CustomerId},
      ${VehicleId}, N'${plan[6] || ""}', N'${plan[7] || ""}', N'${plan[9] || ""}',
      N'${plan[8] || ""}',${userId})
    SELECT SCOPE_IDENTITY() as id;`);
    const newPlan = await pool.request().query(
      `INSERT INTO WeightPlan(PlanNo,PlanDate,WeightType,CustomerId,VehicleId,
        TrailerPlate,DriverName,Remark,ThaiMolassesNo,CreatedBy)
      VALUES  (N'${PlanNo}', N'${PlanDate}', ${WeightType}, ${CustomerId},
        ${VehicleId}, N'${plan[6] || ""}', N'${plan[7] || ""}', N'${plan[9] || ""}',
        N'${plan[8] || ""}',${userId})
      SELECT SCOPE_IDENTITY() as id;`
    );
    const PlanId = newPlan.recordset[0].id;
    console.log(PlanId);
    const ProductId = await checkDup("ProductId", "MasterProduct", `ProductCode = N'${plan[10]}'`);
    await pool.request().query(
      `INSERT INTO WeightCard(PlanId,ProductId,BillNo,BillWeight,Remark)
      VALUES  (N'${PlanId}',N'${ProductId}',N'${plan[11] || ""}',${plan[12] || 0},N'${plan[13] || ""}')
      SELECT SCOPE_IDENTITY() as id;`
    );
    resolve(PlanId);
  });

const insertCard = (pool, card, PlanId) =>
  new Promise(async (resolve, reject) => {
    if (!PlanId) return reject({ message: "PlanId is null" });
    const ProductId = await checkDup("ProductId", "MasterProduct", `ProductCode = N'${card[10]}'`);
    await pool.request().query(
      `INSERT INTO WeightCard(PlanId,ProductId,BillNo,BillWeight,Remark)
      VALUES  (N'${PlanId}',N'${ProductId}',N'${card[11] || ""}',${card[12] || 0},N'${card[13] || ""}')
      SELECT SCOPE_IDENTITY() as id;`
    );
    resolve("card");
  });

const updateWeight = async (type, data) => {
  const pool = await sql.connect(dbconfig);
  if (type === "in") {
    await pool.request().query(
      `UPDATE WeightCard
      SET CardNo = N'${data.CardNo}', Status = 2,
        WeightIn = ${data.Weight}, WeightInDate = GETDATE(),
        ImgInF = N'${data.PlateFront.filename || ""}',
        ImgInT = N'${data.PlateTop.filename || ""}',
        ImgInB = N'${data.PlateBack.filename || ""}'
      WHERE CardId = ${data.CardId};
    UPDATE WeightPlan
      SET Status = 2
      WHERE PlanId = ${data.PlanId} AND NOT Status = 2;`
    );
  } else {
    await pool.request().query(
      `UPDATE WeightCard
      SET Status = 3, WeightOut = ${data.Weight}, WeightOutDate = GETDATE(),
        NetWeight = ${data.NetWeight}, DifWeight = N'${data.DifWeight}',
        ImgOutF = N'${data.PlateFront.filename || ""}',
        ImgOutT = N'${data.PlateTop.filename || ""}',
        ImgOutB = N'${data.PlateBack.filename || ""}'
      WHERE CardId = ${data.CardId};`
    );
  }
  return;
};

const getWeightCards = (query) => {
  const { FromDate, ToDate } = query;
  return `SELECT row_number() over(order by PlanDate desc, CardId desc) as 'index',
      CardId, CardNo, PlanId, Status, FORMAT(PlanDate, 'yyyy-MM-dd') PlanDate,
      FORMAT(CardDate, 'yyyy-MM-dd') CardDate, WeightType, Product, Customer,
      PlanVehicle, PlanTrailer, Shipper,
      BillNo, BillWeight, Remark, WeightIn, WeightOut, NetWeight,
      FORMAT(WeightOutDate, 'dd/MM/yyyy hh:mm') WeightOutDate,
      VehiclePlate, TrailerPlate, DriverName 
    FROM CardView
    ${fromToFilter("PlanDate", FromDate, ToDate, "WHERE")}
    ORDER BY CardId desc`;
};

const getWeightCardAllPlan = (CardNo) => {
  // ทั้ง Plan
  // const { CardNo } = query;
  return `SELECT row_number() over(order by WeightOutDate ASC) as 'index', 
    CardId, CardNo, PlanId, Status, FORMAT(PlanDate, 'yyyy-MM-dd') PlanDate,
    FORMAT(CardDate, 'yyyy-MM-dd') CardDate, WeightType, Product, Customer,
    PlanVehicle, PlanTrailer, PlanDriver, Shipper,
    BillNo, BillWeight, Remark,
    VehiclePlate, TrailerPlate, DriverName,
    FORMAT(WeightInDate, 'dd/MM/yyyy hh:mm') WeightInDate,
    ImgInF, ImgInT, ImgInB, WeightIn,
    FORMAT(WeightOutDate, 'dd/MM/yyyy hh:mm') WeightOutDate,
    ImgOutF, ImgOutT, ImgOutB, WeightOut,
    AdjWeight, NetWeight, DifWeight
    FROM CardView
    WHERE CardNo = '${CardNo}' AND Status = 3
    ORDER BY WeightOutDate ASC`;
};

const getWeightCard = (CardId) =>
  `SELECT  CardId, CardNo, PlanId, Status, FORMAT(PlanDate, 'yyyy-MM-dd') PlanDate,
    FORMAT(CardDate, 'yyyy-MM-dd') CardDate, WeightType, Product, Customer,
    PlanVehicle, PlanTrailer, PlanDriver, Shipper,
    BillNo, BillWeight, Remark, PlanRemark,
    VehiclePlate, TrailerPlate, DriverName,
    FORMAT(WeightInDate, 'dd/MM/yyyy hh:mm') WeightInDate,
    ImgInF, ImgInT, ImgInB, WeightIn,
    FORMAT(WeightOutDate, 'dd/MM/yyyy hh:mm') WeightOutDate,
    ImgOutF, ImgOutT, ImgOutB, WeightOut,
    AdjWeight, NetWeight, DifWeight
  FROM CardView
  WHERE CardId = ${CardId}`;

const getWeightPlans = () =>
  `SELECT TOP 500 row_number() over(order by PlanDate desc, PlanNo desc) as 'index',
  PlanId, PlanNo, FORMAT(PlanDate, 'yyyy-MM-dd') PlanDate,
    Status, CustomerId, CustomerCode, Customer, DriverName,
    FORMAT(CheckDate, 'yyyy-MM-dd hh:mm') CheckDate,
    VehicleId, VehiclePlate, TrailerPlate, WeightType, Remark,
    VehicleTypeId,VehicleType,ShipperId,Shipper,PlanTrailerPlate,PlanDriver,
    ProductInPlan, ThaiMolassesNo, MolassesSellerId, MolassesSeller, MolassesSellerCode
  FROM PlanView
  ORDER BY PlanNo desc`;

const getWeightPlanById = (PlanId) =>
  `SELECT row_number() over(order by PlanDate desc, PlanNo desc) as 'index',
   PlanId, PlanNo, FORMAT(PlanDate, 'yyyy-MM-dd') PlanDate,
    Status, CustomerId, CustomerCode, Customer, DriverName,
    FORMAT(CheckDate, 'yyyy-MM-dd hh:mm') CheckDate,
    VehicleId, VehiclePlate, TrailerPlate, WeightType, Remark,
    VehicleTypeId,VehicleType,ShipperId,Shipper,PlanTrailerPlate,PlanDriver,
    ProductInPlan, ThaiMolassesNo, MolassesSellerId, MolassesSeller, MolassesSellerCode
  FROM PlanView
  WHERE PlanId =${PlanId}
  ORDER BY PlanNo desc`;

const getWeightPlan = (PlanId) =>
  `SELECT PlanId, PlanNo,
    Customer,Shipper, DriverName,
    VehiclePlate, TrailerPlate, WeightType
  FROM PlanView
  WHERE PlanId = ${PlanId}`;

const getWeightPlanCards = (PlanId) =>
  `SELECT CardId, CardNo, Status, PlanId, ProductId,
    ProductCode, Product, BillWeight, BillNo
  FROM CardView
  WHERE PlanId = ${PlanId}
  ORDER BY CardId`;

const getActiveWeightPlanCards = (PlanId) =>
  `SELECT CardId, CardNo, Status, PlanId, ProductId,
    ProductCode, Product, BillWeight, BillNo
  FROM CardView
  WHERE PlanId = ${PlanId} AND NOT Status = 4
  ORDER BY CardId`;

module.exports = {
  genNo,
  changeStatus,
  readExcel,
  checkRow,
  insertPlan,
  insertCard,
  updateWeight,
  getWeightCards,
  getWeightCard,
  getWeightPlans,
  getWeightPlanById,
  getWeightPlan,
  getWeightCardAllPlan,
  getWeightPlanCards,
  getActiveWeightPlanCards,
};
