/**
 * 认证控制器 - Authentication Controller
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// 生成JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * @desc    用户注册
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return next(new AppError('该邮箱已被注册', 400));
      }
      if (existingUser.username === username) {
        return next(new AppError('该用户名已被使用', 400));
      }
    }

    // 创建用户
    const user = await User.create({
      username,
      email,
      password
    });

    // 生成Token
    const token = generateToken(user._id);

    // 返回响应（不包含密码）
    res.status(201).json({
      status: 'success',
      message: '注册成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    用户登录
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 查找用户（包含密码字段）
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new AppError('邮箱或密码错误', 401));
    }

    // 检查密码
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(new AppError('邮箱或密码错误', 401));
    }

    // 检查用户是否被禁用
    if (user.isDeleted) {
      return next(new AppError('账户已被禁用', 401));
    }

    // 生成Token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: '登录成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    用户登出
 */
exports.logout = async (req, res) => {
  // 客户端应删除token
  res.status(200).json({
    status: 'success',
    message: '登出成功'
  });
};

/**
 * @desc    获取当前用户信息
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError('用户不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    刷新Token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new AppError('请提供Token', 400));
    }

    // 验证Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 检查用户是否存在
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('用户不存在', 404));
    }

    // 生成新Token
    const newToken = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Token无效或已过期', 401));
    }
    next(error);
  }
};
