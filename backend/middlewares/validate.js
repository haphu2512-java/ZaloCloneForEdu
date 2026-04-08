const ApiError = require('../utils/apiError');

const validate = (schemas) => (req, _res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    next();
  } catch (error) {
    next(new ApiError(400, 'VALIDATION_ERROR', 'Invalid payload', error));
  }
};

module.exports = validate;
