const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbconfig = require("../../dbconfig");
const { editCard, editSugarReport } = require("../middleware/weight/plan");
const { getWeightCards, getWeightCard, getWeightCardAllPlan } = require("../modules/weight");
const { isAuthEdit } = require("../middleware/checkUser");

router.get("/", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Card = await pool.request().query(getWeightCards(req.query));
    res.status(200).send(JSON.stringify(Card.recordset));
  } catch (err) {
    next(err);
  }
});

router.get("/all/:CardNo", async (req, res, next) => {
  // ทั้ง Plan
  try {
    const { CardNo } = req.params;
    const pool = await sql.connect(dbconfig);
    const Cards = await pool.request().query(getWeightCardAllPlan(CardNo));
    res.status(200).send(JSON.stringify(Cards.recordset));
  } catch (err) {
    next(err);
  }
});

router.get("/:CardId", async (req, res, next) => {
  try {
    const { CardId } = req.params;
    console.log("CardId => ", CardId);
    const pool = await sql.connect(dbconfig);
    const Card = await pool.request().query(getWeightCard(CardId));
    res.status(200).send(Card.recordset[0]);
  } catch (err) {
    next(err);
  }
});

router.use(isAuthEdit("weightCard"));

router.put("/:CardId", editCard, (req, res, next) => res.status(200).send({ message: req.message }));

router.put("/:CardId/sugar", editSugarReport, (req, res, next) => res.status(200).send({ message: req.message }));

module.exports = router;
