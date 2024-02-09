const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbconfig = require("../dbconfig");

const { encrypt, decrypt, decryptName } = require("../libs/utils");
const createHttpError = require("http-errors");
const validate = require("./middleware/validate");
const { addUserValidator, editUserValidator, changePassValidator, addUser, editUser, changePass } = require("./middleware/master/user");
const { activate } = require("./modules/sqlUtils");
const { isAuthEdit } = require("./middleware/checkUser");

router.post("/login", async (req, res, next) => {
  try {
    const { Username, Password } = req.body;
    const pool = await sql.connect(dbconfig);
    const Hashpass = encrypt(Password);
    const login = await pool.request().query(`SELECT *
      FROM Users
      WHERE Username = N'${Username}' AND Password = N'${Hashpass}'`);
    if (!login.recordset.length) return next(createHttpError(403, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"));

    let { UserId, FirstName, Permission } = login.recordset[0];
    req.session.isLoggedIn = true;
    req.session.UserId = UserId;
    req.session.Name = FirstName;
    req.session.Auth = JSON.parse(Permission);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

router.get("/logout", (req, res, next) => {
  req.session = null;
  res.redirect("/login");
});

router.get("/", async (req, res, next) => {
  try {
    let pool = await sql.connect(dbconfig);
    let users = await pool.request().query(`SELECT * ,row_number() over(order by UserId) as 'index' FROM Users`);
    for (let user of users.recordset) {
      user.FirstName = user.FirstName;
      user.LastName = user.LastName;
      user.Password = decrypt(user.Password);
    }
    res.status(200).send(JSON.stringify(users.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.get("/profile", (req, res) => res.status(200).send({ Name: req.session.Name }));

router.use(isAuthEdit("userSetting"));

router.post("/", validate(addUserValidator), addUser, (req, res) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(201).send({ message: req.message });
});

router.put("/:UserId", validate(editUserValidator), editUser, (req, res) => {
  if (req.result == "dup") return next(createHttpError(400, req.message));
  res.status(200).send({ message: req.message });
});

router.put("/:UserId/changepass", validate(changePassValidator), changePass, (req, res) => {
  res.status(200).send({ message: req.message });
});

router.put("/:UserId/deactivate", async (req, res, next) => {
  let { UserId } = req.params;
  try {
    await activate(0, "Users", `UserId = ${UserId}`);
  } catch (err) {
    next(err);
  }
  res.status(200).send({ message: `ปิดการใช้งานผู้ใช้สำเร็จ` });
});

router.put("/:UserId/activate", async (req, res, next) => {
  try {
    let { UserId } = req.params;
    await activate(1, "Users", `UserId = ${UserId}`);
    res.status(200).send({ message: `เปิดการใช้งานผู้ใช้สำเร็จ` });
  } catch (err) {
    next(err);
  }
});

// ! Deprecated
router.delete("/:UserId", async (req, res, next) => {
  try {
    let { UserId } = req.params;
    const pool = await sql.connect(dbconfig);
    await pool.request().query(
      `DELETE FROM Users
        WHERE UserId = ${UserId}`
    );
    res.status(200).send({ message: `ลบผู้ใช้สำเร็จ` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
