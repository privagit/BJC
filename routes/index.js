const express = require("express");
const router = express.Router();

const { isLoggedIn, isNotLoggedIn, isAuth } = require("./middleware/checkUser");

router.get("/", isNotLoggedIn, (req, res) => {
  res.render("index");
});

router.get("/login", (req, res) => {
  res.render("Login");
});

// router.get('/weightcard', (req, res) => {
//     res.render('WeightDashboard');
// })
router.get("/scalelist", isNotLoggedIn, isAuth("weightCard"), (req, res) => {
  res.render("ScaleList");
});

router.get("/scaleplan", isNotLoggedIn, isAuth("weightPlan"), (req, res) => {
  res.render("ScalePlan");
});
router.get("/scalereport", isNotLoggedIn, isAuth("weightCard"), (req, res) => {
  res.render("Report");
});

router.get("/customer", isNotLoggedIn, isAuth("customerSetting"), (req, res) => {
  res.render("MasterCustomer");
});

router.get("/product", isNotLoggedIn, isAuth("productSetting"), (req, res) => {
  res.render("MasterProduct");
});

router.get("/vehicle", isNotLoggedIn, isAuth("vehicleSetting"), (req, res) => {
  res.render("MasterVehicle");
});

router.get("/masterfactory", isNotLoggedIn, isAuth("factorySetting"), (req, res) => {
  res.render("MasterFactory");
});

router.get("/usersetting", isNotLoggedIn, isAuth("userSetting"), (req, res) => {
  res.render("UserSetting");
});

router.get("/about", (req, res) => {
  res.render("About");
});

router.get("/error", (req, res) => {
  res.render("error");
});
module.exports = router;
