/**
 * 好友关系模型 - Friendship Model
 * 管理用户之间的好友关系（含申请/接受/拒绝流程）
 */

const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  // 发起请求的用户
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // 接收请求的用户
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // 状态: pending(待处理), accepted(已接受), rejected(已拒绝)
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  // 附言消息
  message: {
    type: String,
    trim: true,
    maxlength: [200, '附言最多200个字符'],
    default: ''
  },
  // 是否为系统自动添加的好友（如官方好友）
  isSystem: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 复合索引：防止重复好友关系
friendshipSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

// 确保两个用户之间只有一条记录（无论谁发起）
friendshipSchema.pre('save', async function(next) {
  if (this.isNew) {
    // 检查是否已存在反向记录
    const existing = await this.constructor.findOne({
      $or: [
        { fromUser: this.fromUser, toUser: this.toUser },
        { fromUser: this.toUser, toUser: this.fromUser }
      ]
    });
    if (existing) {
      const err = new Error('好友关系已存在');
      err.statusCode = 400;
      return next(err);
    }
  }
  next();
});

// 静态方法：获取用户的好友列表
friendshipSchema.statics.getFriends = function(userId) {
  return this.find({
    $or: [{ fromUser: userId }, { toUser: userId }],
    status: 'accepted'
  }).populate('fromUser toUser', 'username avatar bio');
};

// 静态方法：获取待处理的好友请求
friendshipSchema.statics.getPendingRequests = function(userId) {
  return this.find({
    toUser: userId,
    status: 'pending'
  }).populate('fromUser', 'username avatar bio').sort({ createdAt: -1 });
};

// 静态方法：检查是否为好友
friendshipSchema.statics.areFriends = async function(userId1, userId2) {
  const friendship = await this.findOne({
    $or: [
      { fromUser: userId1, toUser: userId2 },
      { fromUser: userId2, toUser: userId1 }
    ],
    status: 'accepted'
  });
  return !!friendship;
};

const Friendship = mongoose.model('Friendship', friendshipSchema);

module.exports = Friendship;