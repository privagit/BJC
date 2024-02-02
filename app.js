const express = require("express");
const app = express();
const morgan = require("morgan");
const path = require("path");
const cookieSession = require("cookie-session");
const cors = require("cors");
require("dotenv").config();

const logger = require("./libs/logger");

const PORT = process.env.PORT || 3000;

app.use(cors());

app.set("views", path.join(__dirname, "views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use(express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "script")));
app.use(express.static(path.join(__dirname, "node_modules")));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cookieSession({
    name: "ats_session",
    keys: ["priva, ats"],
    maxAge: 1000 * 60 * 60 * 24,
  })
);

let indexRoute = require("./routes/index");
let userRoute = require("./routes/user");

// path master setting
let factoryRoute = require("./routes/master_setting/factory_master");
let customerRoute = require("./routes/master_setting/customer_master");
let shipperRoute = require("./routes/master_setting/shipper_master");
let vehicleTypeRoute = require("./routes/master_setting/vehicle_type_master");
let vehicleRoute = require("./routes/master_setting/vehicle_master");
let productTypeRoute = require("./routes/master_setting/product_type_master");
let productRoute = require("./routes/master_setting/product_master");
let importRoute = require("./routes/master_setting/import_master");

// path main
let dropdownRoute = require("./routes/main/dropdown");
let dashboardRoute = require("./routes/main/dashboard");
let weightPlanRoute = require("./routes/main/weightPlan");
let weightCardRoute = require("./routes/main/weightCard");
let weightOperationRoute = require("./routes/main/weightOperation");
let weightReportRoute = require("./routes/main/weightReport");
let testRoute = require("./routes/main/test");

app.use("/", indexRoute);
app.use("/user", userRoute);

app.use("/factory_master", factoryRoute);
app.use("/customer_master", customerRoute);
app.use("/shipper_master", shipperRoute);
app.use("/vehicle_type_master", vehicleTypeRoute);
app.use("/vehicle_master", vehicleRoute);
app.use("/product_type_master", productTypeRoute);
app.use("/product_master", productRoute);
app.use("/import_master", importRoute);

app.use("/dropdown", dropdownRoute);
app.use("/dashboard", dashboardRoute);
app.use("/weight/plan", weightPlanRoute);
app.use("/weight/card", weightCardRoute);
app.use("/weight/operation", weightOperationRoute);
app.use("/weight/report", weightReportRoute);
app.use("/api/test", testRoute);

// Error
app.use((err, req, res, next) => {
  console.log(err);
  if (err.status && err.status != 500) logger.warn(`${err.message}`);
  else logger.error(`${err.message}`);
  res.status(err.status || 500).send({ message: `${err.message}` });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

module.exports = app;
