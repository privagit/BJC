const sql = require('mssql');
const { z } = require('zod');
const dbconfig = require('../../../dbconfig');
const { checkDup } = require('../../modules/sqlUtils');

const factoryValidator = {
  schema: z.object({
    body: z.object({
      FactoryName: z.string().min(1),
      FactoryAddress: z.string(),
      FactoryTel: z.string(),
    }),
  }),
  message: 'กรุณากรอกชื่อ ที่อยู่ และเบอร์โทรโรงงาน',
};

const addFactory = async (req, res, next) => {
  try {
    const { FactoryName, FactoryAddress, FactoryTel } = req.body;

    const pool = await sql.connect(dbconfig);
    await pool.request().query(`
      INSERT MasterFactory(FactoryName,FactoryAddress,FactoryTel)
      VALUES(N'${FactoryName}',N'${FactoryAddress}',N'${FactoryTel}')`);
    req.result = 'ok';
    req.message = 'แก้ไขข้อมูลโรงงานสำเร็จ';
    next();
  } catch (err) {
    next(err);
  }
};

const editFactory = async (req, res, next) => {
  try {
    const { FactoryId } = req.params;
    const { FactoryName, FactoryAddress, FactoryTel } = req.body;

    const pool = await sql.connect(dbconfig);
    await pool.request().query(`
      UPDATE MasterFactory
      SET FactoryName = N'${FactoryName}',
        FactoryAddress = N'${FactoryAddress}',
        FactoryTel = N'${FactoryTel}'
      WHERE FactoryId = ${FactoryId}`);
    req.result = 'ok';
    req.message = 'แก้ไขข้อมูลโรงงานสำเร็จ';
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  factoryValidator,
  addFactory,
  editFactory,
};
