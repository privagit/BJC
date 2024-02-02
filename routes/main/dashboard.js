const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbconfig = require("../../dbconfig");

const { checkDate } = require("../../libs/date");

router.get("/data", async (req, res, next) => {
  try {
    let pool = await sql.connect(dbconfig);
    let SelectCards = `SELECT COUNT(CardId) TotalList, SUM(NetWeight) TotalWeight,
      (SELECT COUNT(CardId) FROM WeightCard WHERE DATEDIFF(day,WeightInDate,'${checkDate()}') = 0 AND Status IN (1,2)) RemainList,
      (SELECT COUNT(CardId) FROM WeightCard WHERE DATEDIFF(day,WeightInDate,'${checkDate()}') = 0 AND Status = 3) CompleteList,
      (SELECT COUNT(CardId) FROM WeightCard WHERE DATEDIFF(day,WeightInDate,'${checkDate()}') = 0 AND Status = 2)
      + (SELECT COUNT(CardId) FROM WeightCard WHERE DATEDIFF(day,WeightInDate,'${checkDate()}') = 0 AND Status = 3)*2 Traffic,
      (SELECT COUNT(CardId) FROM WeightCard WHERE DATEDIFF(day,WeightInDate,'${checkDate()}') = 0 AND Status IN (2,3)) Product,
      (SELECT COUNT(CardId) FROM WeightCard WHERE DATEDIFF(day,WeightInDate,'${checkDate()}') = 0 AND Status IN (2,3)) Customer
    FROM WeightCard WHERE DATEDIFF(day,WeightInDate,'${checkDate()}') = 0`;
    let Cards = await pool.request().query(SelectCards);
    res.status(200).send(JSON.stringify(Cards.recordset[0]));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
