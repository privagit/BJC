const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbconfig = require('../../dbconfig');

// Show Dropdown
router.get('/', async (req, res, next) => {
  try {
    console.log(req.baseUrl);
    res.status(200).send({ message: 'test' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
