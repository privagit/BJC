const sql = require("mssql");
const dbconfig = require("../../dbconfig");
const { dymDateThMin } = require("../../libs/date");
const { fromToFilter, whereFilter } = require("./sqlUtils");

const getWeightPlanReport = (query) => {
  const { ProductId, CustomerId, WeightType, FromDate, ToDate } = query;
  return `SELECT CardId, CardNo, PlanId, Status,
      FORMAT(CardDate, 'dd-MM-yyyy') CardDate, Product,Customer,
      VehiclePlate, TrailerPlate, DriverName,Remark
    FROM CardView
    WHERE Status = 3
      ${whereFilter("ProductId", ProductId ? `N'${ProductId}'` : "")} ${whereFilter("CustomerId", CustomerId ? `N'${CustomerId}'` : "")}
      ${whereFilter("WeightType", WeightType || 1)} ${fromToFilter("CardDate", FromDate, ToDate)}
    ORDER BY CardDate`;
};

const getMolassesReport = (query) => {
  const { FromDate, ToDate } = query;
  return `SELECT row_number() over(order by WeightInDate) as 'index',
      CardId,FORMAT(CardDate, 'dd-MM-yyyy') CardDate, FORMAT(WeightOutDate, 'HH:mm') FinishTime, 
      CardNo, BillNo, BillWeight, NetWeight, ThaiMolassesNo, MolassesSeller,
      Customer, VehiclePlate, TrailerPlate, Shipper, 
      Batch,ReceiveBy,Barrel,Sweetness,Brix,SpecificGravity,Temperature,
      DifWeight
    FROM CardView
    WHERE Status = 3 AND Product = N'กากน้ำตาล' ${fromToFilter("CardDate", FromDate, ToDate)}
    ORDER BY WeightInDate`;
};

const getSummaryMolassesReport = (query) => {
  const { FromDate, ToDate } = query;
  return `SELECT COUNT(CardId) Total, SUM(BillWeight) SumBillWeight, SUM(NetWeight) SumNetWeight,
      AVG(Sweetness) AvgSweetness, AVG(Brix) AvgBrix, AVG(SpecificGravity) AvgSpecificGravity,SUM(Barrel) SumBarrel
    FROM CardView
    WHERE Status = 3 AND Product = N'กากน้ำตาล'
    ${fromToFilter("CardDate", FromDate, ToDate)}`;
};

const getMolassesCustomerReport = (query) => {
  const { FromDate, ToDate } = query;
  return `SELECT CustomerId,Customer, Shipper, SUM(BillWeight) SumBillWeight, SUM(NetWeight) SumNetWeight, SUM(DifWeight) SumDifWeight, COUNT(CardId) CountWeightCard,
        AVG(Sweetness) AvgSweetness, AVG(Brix) AvgBrix, AVG(SpecificGravity) AvgSpecificGravity,SUM(Barrel) SumBarrel 
      FROM CardView
      WHERE Status = 3 AND Product = N'กากน้ำตาล' ${fromToFilter("CardDate", FromDate, ToDate)}
      GROUP BY CustomerId,Customer,Shipper
      ORDER BY CustomerId`;
};

const writeXlsx = async (wb, filename) => {
  await wb.toFileAsync(`./public/report/${filename}`);
};

const getFactory = async () => {
  const pool = await sql.connect(dbconfig);
  const Factory = await pool.request().query(`SELECT TOP 1 * FROM MasterFactory`);
  return Factory.recordset[0];
};

const fillScaleListReport = async (ws, data, query) => {
  const { FromDate, ToDate } = query;
  const { FactoryName } = await getFactory();
  const dateText = ToDate ? `${dymDateThMin(FromDate)} ถึง ${dymDateThMin(ToDate)}` : dymDateThMin(FromDate);
  ws.row(2).cell(2).value(FactoryName);
  ws.row(3).cell(2).value(`รายการชั่ง ประจำวันที่ ${dateText}`);
  let row = 6;
  data.forEach((card) => {
    const {
      index,
      CardDate,
      CardNo,
      Status,
      WeightType,
      BillNo,
      BillWeight,
      Customer,
      VehiclePlate,
      TrailerPlate,
      Shipper,
      Product,
      WeightIn,
      WeightOut,
      NetWeight,
      WeightOutDate,
    } = card;
    const statusName = Status == 1 ? "รอการชั่ง" : Status == 2 ? "รอรถออก" : Status == 3 ? "ชั่งสำเร็จ" : "ยกเลิก";
    row++;
    ws.row(row).cell(2).value(index).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(3).value(CardNo).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(4).value(CardDate).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(5).value(VehiclePlate).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row)
      .cell(6)
      .value(TrailerPlate || "")
      .style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(7).value(Customer).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(8).value(Shipper).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row)
      .cell(9)
      .value(WeightType == 1 ? "ชั่งเข้า" : "ชั่งออก")
      .style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(10).value(Product).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(11).value(BillNo).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(12).value(BillWeight).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(13).value(WeightIn).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(14).value(WeightOut).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(15).value(NetWeight).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(16).value(statusName).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(17).value(WeightOutDate).style({ horizontalAlignment: "center", borderStyle: "thin" });
  });
};

const fillWeightPlanReport = async (ws, data, query) => {
  const { FromDate, ToDate, WeightType } = query;
  let row = 4;
  let lastDay = "",
    count = 0,
    total = 0;
  const { Product, Customer } = data[0];
  const { FactoryName } = await getFactory();
  const fromto = WeightType == 1 ? `จาก ${Customer} ไปยัง ${FactoryName}` : `จาก ${FactoryName} ไปยัง ${Customer}`;
  const dateText = ToDate ? `${dymDateThMin(FromDate)} ถึง ${dymDateThMin(ToDate)}` : dymDateThMin(FromDate);
  ws.row(2).cell(2).value(`รายการขน ${Product} ประจำวันที่ ${dateText}`);
  ws.row(3).cell(2).value(fromto);
  data.push({ CardDate: "" });
  data.forEach((card, i) => {
    const { CardDate, VehiclePlate, TrailerPlate, DriverName, Remark } = card;
    row++;
    if (i === 0) lastDay = CardDate;
    if (lastDay !== CardDate) {
      ws.row(row).cell(2).style({ borderStyle: "thin" });
      ws.row(row).cell(3).value("รวม").style({ horizontalAlignment: "right", borderStyle: "thin" });
      ws.row(row).cell(4).value(count).style({ horizontalAlignment: "center", borderStyle: "thin" });
      ws.row(row).cell(5).value("คัน").style({ horizontalAlignment: "center", borderStyle: "thin" });
      ws.row(row).cell(6).style({ borderStyle: "thin" });
      row++;
      total += count;
      if (CardDate === "") {
        ws.row(row).cell(3).value("รวมทั้งสิ้น").style({ horizontalAlignment: "right", borderStyle: "thin" });
        ws.row(row).cell(4).value(total).style({ horizontalAlignment: "center", borderStyle: "thin" });
        ws.row(row).cell(5).value("คัน").style({ horizontalAlignment: "center", borderStyle: "thin" });
        return;
      }
      count = 0;
      lastDay = CardDate;
    }
    count++;
    ws.row(row).cell(2).value(CardDate).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row)
      .cell(3)
      .value(`${VehiclePlate || ""}${TrailerPlate ? `, ${TrailerPlate}` : ""}`);
    ws.row(row).cell(4).value(1).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(5).value(DriverName).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(6).value(Remark).style({ horizontalAlignment: "center", borderStyle: "thin" });
    i++;
  });
};

const fillMolassesReport = async (ws, data, summary, query) => {
  const { FactoryName } = await getFactory();
  const { FromDate, ToDate } = query;
  const dateText = ToDate ? `${dymDateThMin(FromDate)} ถึง ${dymDateThMin(ToDate)}` : dymDateThMin(FromDate);
  ws.row(2).cell(2).value(FactoryName);
  ws.row(3).cell(2).value(`รายงานการรับกากน้ำตาล ประจำวันที่ ${dateText}`);
  let row = 6;
  data.forEach((card) => {
    const {
      index,
      CardDate,
      FinishTime,
      CardNo,
      BillNo,
      BillWeight,
      NetWeight,
      Customer,
      VehiclePlate,
      TrailerPlate,
      Shipper,
      Batch,
      ReceiveBy,
      Barrel,
      Sweetness,
      Brix,
      SpecificGravity,
      Temperature,
      ThaiMolassesNo,
      MolassesSeller,
    } = card;
    row++;
    ws.row(row).cell(2).value(index).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row)
      .cell(3)
      .value(`${VehiclePlate}${TrailerPlate ? `, ${TrailerPlate}` : ""}`);
    ws.row(row).cell(4).value(BillNo).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(5).value(CardNo).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(6).value(ThaiMolassesNo).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(7).value(Batch).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(8).value(ReceiveBy).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(9).value(CardDate).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(10).value(MolassesSeller).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(11).value(Customer).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(12).value(Shipper).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(13).value(BillWeight).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(14).value(NetWeight).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row)
      .cell(15)
      .value(BillWeight - NetWeight)
      .style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(16).value(Barrel).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(17).value(Sweetness).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(18).value(Brix).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(19).value(SpecificGravity).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(20).value(Temperature).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(21).value(FinishTime).style({ horizontalAlignment: "center", borderStyle: "thin" });
  });
  const { Total, SumBillWeight, SumNetWeight, AvgSweetness, AvgBrix, AvgSpecificGravity } = summary[0];
  row++;
  ws.row(row).cell(9).value("รวม").style({ horizontalAlignment: "right", borderStyle: "thin" });
  ws.row(row).cell(10).value(Total).style({ horizontalAlignment: "center", borderStyle: "thin" });
  ws.row(row).cell(11).value("คันรถ").style({ horizontalAlignment: "left", borderStyle: "thin" });
  ws.row(row).cell(13).value(SumBillWeight).style({ horizontalAlignment: "center", borderStyle: "thin" });
  ws.row(row).cell(14).value(SumNetWeight).style({ horizontalAlignment: "center", borderStyle: "thin" });
  ws.row(row)
    .cell(15)
    .value(SumBillWeight - SumNetWeight)
    .style({ horizontalAlignment: "center", borderStyle: "thin" });
  ws.row(row).cell(17).value(AvgSweetness).style({ horizontalAlignment: "center", borderStyle: "thin" });
  ws.row(row).cell(18).value(AvgBrix).style({ horizontalAlignment: "center", borderStyle: "thin" });
  ws.row(row).cell(19).value(AvgSpecificGravity).style({ horizontalAlignment: "center", borderStyle: "thin" });
};

const fillMolassesCustomerReport = async (ws, data, summary, query) => {
  const { FactoryName } = await getFactory();
  const { FromDate, ToDate } = query;
  const dateText = ToDate ? `${dymDateThMin(FromDate)} ถึง ${dymDateThMin(ToDate)}` : dymDateThMin(FromDate);
  ws.row(2).cell(2).value(FactoryName);
  ws.row(3).cell(2).value(`รายงานข้อมูลการรับกากน้ำตาล ประจำวันที่ ${dateText}`);
  let row = 6;
  data.forEach((card, i) => {
    const { Customer, Shipper, SumBillWeight, SumNetWeight, CountWeightCard, AvgSweetness, AvgBrix, AvgSpecificGravity, SumBarrel } = card;
    row++;
    ws.row(row).cell(2).value(Customer).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(3).value(Shipper).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(4).value(SumBillWeight).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(5).value(SumNetWeight).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row)
      .cell(6)
      .value(SumBillWeight - SumNetWeight)
      .style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(7).value(CountWeightCard).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(8).value(AvgSweetness).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(9).value(AvgBrix).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(10).value(AvgSpecificGravity).style({ horizontalAlignment: "center", borderStyle: "thin" });
    ws.row(row).cell(11).value(SumBarrel).style({ horizontalAlignment: "center", borderStyle: "thin" });
  });
  const { Total, SumBillWeight, SumNetWeight, AvgSweetness, AvgBrix, AvgSpecificGravity, SumBarrel } = summary[0];
  row++;
  ws.row(row).cell(3).value("รวม").style({ horizontalAlignment: "right", borderStyle: "thin" });
  ws.row(row).cell(4).value(SumBillWeight).style({ horizontalAlignment: "center", borderStyle: "thin" });
  ws.row(row).cell(5).value(SumNetWeight).style({ horizontalAlignment: "center", borderStyle: "thin" });
  ws.row(row)
    .cell(6)
    .value(SumBillWeight - SumNetWeight)
    .style({ horizontalAlignment: "center", borderStyle: "thin" });
  ws.row(row).cell(7).value(Total).style({ horizontalAlignment: "center", borderStyle: "thin" });
  ws.row(row).cell(8).value(AvgSweetness).style({ horizontalAlignment: "center", borderStyle: "thin" });
  ws.row(row).cell(9).value(AvgBrix).style({ horizontalAlignment: "center", borderStyle: "thin" });
  ws.row(row).cell(10).value(AvgSpecificGravity).style({ horizontalAlignment: "center", borderStyle: "thin" });
  ws.row(row).cell(11).value(SumBarrel).style({ horizontalAlignment: "center", borderStyle: "thin" });
};

module.exports = {
  getWeightPlanReport,
  getMolassesReport,
  getSummaryMolassesReport,
  getMolassesCustomerReport,
  writeXlsx,
  fillScaleListReport,
  fillWeightPlanReport,
  fillMolassesReport,
  fillMolassesCustomerReport,
};
