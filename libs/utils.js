const encrypt = (data) => Buffer.from(data).toString("base64");
const decrypt = (data) => Buffer.from(data, "base64").toString("ascii");

const encryptName = (data) => encodeURIComponent(data);
const decryptName = (data) => decodeURIComponent(data);

const excelEpoc = new Date(1900, 0, -1).getTime();
const msDay = 86400000;

function excelDateToJavascript(excelDate) {
  return new Date(excelEpoc + excelDate * msDay);
}

module.exports = {
  encrypt,
  encryptName,
  decrypt,
  decryptName,
  excelDateToJavascript,
};
