/**
 * 错误处理中间件 - Error Handler
 */

/**
 * 错误对象类
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 开发环境错误详情
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * 生产环境错误详情
 */
const sendErrorProd = (err, res) => {
  // 已知错误
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // 未知错误
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
};

/**
 * Mongoose验证错误
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `数据验证失败: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Mongoose重复键错误
 */
const handleDuplicateError = (err) => {
  const value = err.errmsg && err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `${value} 已存在，请使用其他值`;
  return new AppError(message, 400);
};

/**
 * Mongoose CastError（ObjectId错误）
 */
const handleCastError = (err) => {
  const message = `无效的 ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * JWT Token错误
 */
const handleJWTError = () => {
  return new AppError('Token无效，请重新登录', 401);
};

/**
 * JWT过期错误
 */
const handleJWTExpiredError = () => {
  return new AppError('Token已过期，请重新登录', 401);
};

/**
 * 主错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const env = process.env.NODE_ENV || 'development';

  if (env === 'development') {
    sendErrorDev(err, res);
  } else if (env === 'production') {
    // 处理特定类型的错误
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    }
    if (err.code === 11000) {
      error = handleDuplicateError(err);
    }
    if (err.name === 'CastError') {
      error = handleCastError(err);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
};

module.exports = {
  AppError,
  errorHandler
};
