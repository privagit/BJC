const createHttpError = require("http-errors");
const { z } = require("zod");
const logger = require("../../libs/logger");

const validate = (validator) => (req, res, next) => {
  try {
    logger.debug(req.body);
    validator.schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    next();
  } catch (err) {
    next(createHttpError(400, validator.message));
  }
};

module.exports = validate;
