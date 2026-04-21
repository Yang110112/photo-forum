/**
 * 用户模型 - User Model
 * 论坛系统的用户数据结构
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少3个字符'],
    maxlength: [20, '用户名最多20个字符'],
    match: [/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线']
  },
  email: {
    type: String,
    required: [true, '邮箱不能为空'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱']
  },
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码至少6个字符'],
    select: false  // 默认不返回密码字段
  },
  avatar: {
    type: String,
    default: '/uploads/default-avatar.png'
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [200, '个人简介最多200个字符'],
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// 密码加密中间件
userSchema.pre('save', async function(next) {
  // 如果密码未修改，直接跳过
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 排除敏感字段的toJSON方法
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.isDeleted;
  return user;
};

// 静态方法：获取活跃用户列表
userSchema.statics.getActiveUsers = function(page = 1, limit = 10) {
  return this.find({ isDeleted: false })
    .select('-password -isDeleted')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
