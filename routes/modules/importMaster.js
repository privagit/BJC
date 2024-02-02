const { checkDup } = require("./sqlUtils");

const FieldLimit = { customer: 5, product: 6, vehicle: 3 };

const transformRow = (pool, Table, row) =>
  new Promise(async (resolve, reject) => {
    let result;
    console.log(Table, row);
    if (Table == "customer") result = await insertCustomer(pool, row);
    else if (Table == "vehicle") result = await insertVehicle(pool, row);
    else if (Table == "product") result = await insertProduct(pool, row);
    resolve(result);
  });

const insertCustomer = (pool, row) =>
  new Promise(async (resolve, reject) => {
    const dupId = await checkDup("CustomerId", "MasterCustomer", `CustomerCode = N'${row[0]}'`);
    if (dupId) {
      await pool.request().query(`UPDATE MasterCustomer
      SET Customer = N'${row[1]}',
        Address = N'${row[2] || ""}', Tel = N'${row[3] || ""}',
        Remark = N'${row[4] || ""}'
      WHERE CustomerId = ${dupId}`);
      return resolve("dup");
    }
    await pool.request().query(`INSERT INTO MasterCustomer
        (CustomerCode,Customer,Address,Tel,Remark)
        VALUES  (N'${row[0]}',N'${row[1]}',
          N'${row[2] || ""}',N'${row[3] || ""}',N'${row[4] || ""}')`);
    resolve("insert");
  });

const insertVehicle = (pool, row) =>
  new Promise(async (resolve, reject) => {
    let shipperId = null,
      vehicleTypeId = null;
    if (row[0]) {
      shipperId = await checkDup("ShipperId", "MasterShipper", `Shipper = N'${row[0]}'`);
      if (!shipperId) {
        shipperId = (
          await pool.request().query(
            `INSERT INTO MasterShipper(Shipper)
          VALUES(N'${row[0]}')
          SELECT SCOPE_IDENTITY() as id;`
          )
        ).recordset[0].id;
      }
    }
    if (row[1]) {
      vehicleTypeId = await checkDup("VehicleTypeId", "MasterVehicleType", `VehicleType = N'${row[1]}'`);
      if (!vehicleTypeId)
        vehicleTypeId = (
          await pool.request().query(
            `INSERT INTO MasterVehicleType(VehicleType)
            VALUES  (N'${row[1]}')
            SELECT SCOPE_IDENTITY() as id;`
          )
        ).recordset[0].id;
    }

    const dupId = await checkDup("VehicleId", "MasterVehicle", `VehiclePlate = N'${row[2]}'`);
    if (dupId) {
      await pool.request().query(
        `UPDATE MasterVehicle
        SET VehiclePlate = N'${row[2]}',
          VehicleTypeId = ${vehicleTypeId},
          ShipperId = ${shipperId}
        WHERE VehicleId = ${dupId}`
      );
      return resolve("dup");
    }
    await pool.request().query(`INSERT INTO MasterVehicle(VehiclePlate,VehicleTypeId,ShipperId)
      VALUES  (N'${row[2]}',${vehicleTypeId},${shipperId})`);
    resolve("insert");
  });

const insertProduct = (pool, row) =>
  new Promise(async (resolve, reject) => {
    let productTypeId = null;
    if (row[0]) {
      productTypeId = await checkDup("ProductTypeId", "MasterProductType", `ProductType = N'${row[0]}'`);
      if (!productTypeId)
        productTypeId = (
          await pool.request().query(
            `INSERT INTO MasterProductType(ProductType)
            VALUES  (N'${row[0]}')
            SELECT SCOPE_IDENTITY() as id;`
          )
        ).recordset[0].id;
    }

    const dupId = await checkDup("ProductId", "MasterProduct", `ProductCode = N'${row[1]}'`);
    if (dupId) {
      await pool.request().query(
        `UPDATE MasterProduct
        SET ProductCode = N'${row[1]}', Product = N'${row[2]}',
        ProductTypeId = ${productTypeId}, Price = ${row[3] || 0},
        Weight = ${row[4] || 0}, Remark = N'${row[5] || ""}'
        WHERE ProductId = ${dupId}`
      );
      return resolve("dup");
    }
    await pool.request().query(
      `INSERT INTO MasterProduct(ProductCode,Product,ProductTypeId,Price,Weight,Remark)
      VALUES  (N'${row[1]}',N'${row[2]}',${productTypeId},
        ${row[3] || 0},${row[4] || 0},N'${row[5] || ""}')`
    );
    resolve("insert");
  });

module.exports = { FieldLimit, transformRow };
