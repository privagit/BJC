const winston = require('winston');
const fs = require('fs');
require('dotenv').config();

const logDir = 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level =
  (process.env.NODE_ENV || 'development') !== 'development' ? 'info' : 'debug';

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({ filename: `${logDir}/all.log` }),
  new winston.transports.File({
    filename: `${logDir}/alert.log`,
    level: 'warn',
  }),
];

const logger = winston.createLogger({
  level,
  levels,
  format,
  transports,
});

module.exports = logger;
