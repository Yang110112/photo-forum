/**
 * 用户控制器 - User Controller
 */

const User = require('../models/User');
const Post = require('../models/Post');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    获取当前用户信息
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError('用户不存在', 404));
    }

    // 获取用户的帖子数量
    const postCount = await Post.countDocuments({
      author: user._id,
      status: 'published',
      isDeleted: false
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user.toJSON(),
          postCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新当前用户信息
 */
exports.updateMe = async (req, res, next) => {
  try {
    const { username, bio, avatar } = req.body;
    const userId = req.user._id;

    // 检查用户名是否被占用
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: userId }
      });
      if (existingUser) {
        return next(new AppError('该用户名已被使用', 400));
      }
    }

    // 更新用户
    const updateFields = {};
    if (username) updateFields.username = username;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatar) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: '用户信息更新成功',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    修改密码
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 获取用户（包含密码）
    const user = await User.findById(req.user._id).select('+password');

    // 验证当前密码
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return next(new AppError('当前密码错误', 400));
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: '密码修改成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取用户详情
 */
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return next(new AppError('用户不存在', 404));
    }

    // 获取用户的帖子数量
    const postCount = await Post.countDocuments({
      author: user._id,
      status: 'published',
      isDeleted: false
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user.toJSON(),
          postCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取用户列表
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await User.getActiveUsers(parseInt(page), parseInt(limit));

    res.status(200).json({
      status: 'success',
      ...result
    });
  } catch (error) {
    next(error);
  }
};
