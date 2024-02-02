const multer = require("multer");
const path = require("path");
const sql = require("mssql");
const dbconfig = require("../../dbconfig");
const fs = require("fs");
const { checkDateTime, checkDate } = require("../../libs/date");

const plateMulter = multer({
  storage: multer.diskStorage({
    // destination: path.join(process.cwd(), "./public/img/Vehicle"),
    destination: function (req, file, cb) {
      // ตั้งชื่อโฟลเดอร์ตามประเภทของไฟล์
      let folder;
      if (file.fieldname.includes("front")) {
        folder = path.join(process.cwd(), "./public/img/Vehicle/front");
      } else if (file.fieldname.includes("back")) {
        folder = path.join(process.cwd(), "./public/img/Vehicle/back");
      } else if (file.fieldname.includes("top")) {
        folder = path.join(process.cwd(), "./public/img/Vehicle/top");
      }
      cb(null, folder);
    },
    filename: async (req, file, cb) => {
      try {
        const { CardId, WeightDate } = JSON.parse(req.params.Data);
        const pool = await sql.connect(dbconfig);
        const card = await pool.request().query(
          `SELECT WeightIn
          FROM WeightCard WHERE CardId = ${CardId}`
        );
        const { WeightIn } = card.recordset[0];
        const imgType = file.fieldname.includes("front") ? "F" : file.fieldname.includes("top") ? "T" : "B";
        const weightType = WeightIn ? "O" : "I";
        let date = new Date();
        let dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
        const ext = file.mimetype.split("/")[1];
        cb(null, dateStr + "_" + weightType + imgType + CardId + "." + ext);
      } catch (err) {
        console.log(err);
      }
    },
  }),
}).fields([{ name: "platefront" }, { name: "platetop" }, { name: "plateback" }]);
exports.uploadPlate = (req, res) =>
  new Promise((resolve, reject) =>
    plateMulter(req, res, (err) => {
      if (err) return reject(err);
      if (!req.files)
        return resolve({
          PlateFront: { filename: "" },
          PlateTop: { filename: "" },
          PlateBack: { filename: "" },
        });
      return resolve({
        PlateFront: req.files.platefront ? req.files.platefront[0] : { filename: "" },
        PlateTop: req.files.platetop ? req.files.platetop[0] : { filename: "" },
        PlateBack: req.files.plateback ? req.files.plateback[0] : { filename: "" },
      });
    })
  );

const planMulter = multer({
  storage: multer.diskStorage({
    destination: path.join(process.cwd(), "./public/plan"),
    filename: async (req, file, cb) => {
      cb(null, "PL_" + checkDate() + ".xlsx");
    },
  }),
}).single("plan");
exports.uploadPlan = (req, res) =>
  new Promise((resolve, reject) =>
    planMulter(req, res, (err) => {
      if (err) return reject(err);
      if (!req.file) reject({ message: "File not found" });
      resolve(req.file);
    })
  );

const multerMaster = multer({
  storage: multer.diskStorage({
    destination: path.join(process.cwd(), "./public/import"),
    filename: async (req, file, cb) => {
      let Table = req.baseUrl.split("/")[1].split("_")[0];
      let date = checkDateTime();
      cb(null, Table + "-" + date.replace(/[-: ]/g, "") + ".xlsx");
    },
  }),
}).single("master");
exports.uploadMaster = async (req, res) =>
  new Promise((resolve, reject) => {
    multerMaster(req, res, (err) => {
      if (err) reject(err);
      if (!req.file) return reject({ message: "File not found" });
      resolve(req.file.path);
    });
  });

exports.changeImgName = (status, des, filename) => {
  let newFilename = filename.slice(0, 16) + status + filename.slice(16);
  fs.rename(`${des}\\${filename}`, `${des}\\${newFilename}`, (err) => {
    if (err) console.log(err);
  });
  return newFilename;
};

exports.copyImg = (oldImgname) => {
  let Fullpath = path.join(process.cwd(), `./public/Images/Vehicle`);
  let PreImgname = oldImgname.replace("I", "O");
  fs.copyFile(`${Fullpath}/${oldImgname}`, `${Fullpath}/${PreImgname}`, (err) => {
    if (err) {
      console.log(err);
    }
  });
  return PreImgname;
};
