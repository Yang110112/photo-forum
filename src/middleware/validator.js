/**
 * 验证中间件 - Validation Middleware
 */

const { validationResult } = require('express-validator');

/**
 * 验证请求
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return res.status(400).json({
      status: 'fail',
      message: '验证失败',
      errors: formattedErrors
    });
  }

  next();
};

module.exports = validate;
