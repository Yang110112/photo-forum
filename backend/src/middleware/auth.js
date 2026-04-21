/**
 * 认证中间件 - JWT Authentication
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 认证保护
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 从Authorization header获取token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: '未登录，请先登录'
      });
    }

    try {
      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 获取用户
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: '用户不存在'
        });
      }

      if (user.isDeleted) {
        return res.status(401).json({
          status: 'error',
          message: '账户已被禁用'
        });
      }

      // 将用户信息添加到req
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token无效'
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token已过期'
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// 管理员权限
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      status: 'error',
      message: '需要管理员权限'
    });
  }
};

// 生成JWT Token
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// 可选认证（不强制要求登录）
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && !user.isDeleted) {
          req.user = user;
        }
      } catch (error) {
        // Token无效时继续，不影响请求
      }
    }

    next();
  } catch (error) {
    next();
  }
};
