/**
 * 关注关系模型 - Follow Model
 * 管理用户之间的关注关系（单向关注）
 */

const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  // 关注者
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // 被关注者
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// 复合唯一索引：防止重复关注
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// 防止自己关注自己
followSchema.pre('save', async function(next) {
  if (this.follower.toString() === this.following.toString()) {
    const err = new Error('不能关注自己');
    err.statusCode = 400;
    return next(err);
  }

  if (this.isNew) {
    const existing = await this.constructor.findOne({
      follower: this.follower,
      following: this.following
    });
    if (existing) {
      const err = new Error('已经关注了该用户');
      err.statusCode = 400;
      return next(err);
    }
  }
  next();
});

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;