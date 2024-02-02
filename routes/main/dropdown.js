const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbconfig = require("../../dbconfig");

// Show Dropdown
router.get("/customer", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Customer = await pool.request().query(
      `Select CustomerId, CustomerCode, Customer
      FROM MasterCustomer WHERE Active = 1 ORDER BY CustomerCode`
    );
    res.status(200).send(JSON.stringify(Customer.recordset));
  } catch (err) {
    next(err);
  }
});

router.get("/shipper", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Shipper = await pool.request().query(
      `Select ShipperId, Shipper
      FROM MasterShipper WHERE Active = 1 ORDER BY Shipper`
    );
    res.status(200).send(JSON.stringify(Shipper.recordset));
  } catch (err) {
    next(err);
  }
});

router.get("/vehicletype", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const VehicleType = await pool.request().query(
      `Select VehicleTypeId, VehicleType
      FROM MasterVehicleType WHERE Active = 1 ORDER BY VehicleTypeId`
    );
    res.status(200).send(JSON.stringify(VehicleType.recordset));
  } catch (err) {
    next(err);
  }
});

router.get("/vehicle", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Vehicle = await pool.request().query(
      `Select a.VehicleId, a.VehicleTypeId, a.ShipperId, a.VehiclePlate, b.VehicleType, c.Shipper
      FROM MasterVehicle a
      LEFT JOIN MasterVehicleType b ON a.VehicleTypeId = b.VehicleTypeId
      LEFT JOIN MasterShipper c ON a.ShipperId = c.ShipperId
      WHERE a.Active = 1 ORDER BY VehiclePlate`
    );
    res.status(200).send(JSON.stringify(Vehicle.recordset));
  } catch (err) {
    next(err);
  }
});

router.get("/producttype", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const ProductType = await pool.request().query(
      `Select ProductTypeId, ProductType
      FROM MasterProductType WHERE Active = 1 ORDER BY ProductTypeId`
    );
    res.status(200).send(JSON.stringify(ProductType.recordset));
  } catch (err) {
    next(err);
  }
});

router.get("/product", async (req, res, next) => {
  try {
    const pool = await sql.connect(dbconfig);
    const Product = await pool.request().query(
      `Select a.ProductId, a.productTypeId, a.Product, a.ProductCode, b.ProductType
      FROM MasterProduct a
      LEFT JOIN MasterProductType b ON a.ProductTypeId = b.ProductTypeId
      WHERE a.Active = 1 ORDER BY a.ProductCode`
    );
    res.status(200).send(JSON.stringify(Product.recordset));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
