/**
 * 点赞模型 - Like Model
 * 用户对帖子或评论的点赞记录
 */

const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['post', 'comment'],
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// 复合唯一索引：同一用户只能点赞同一目标一次
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

// 静态方法：检查是否已点赞
likeSchema.statics.isLiked = async function(userId, targetType, targetId) {
  const like = await this.findOne({ user: userId, targetType, targetId });
  return !!like;
};

// 静态方法：点赞（帖子或评论）
likeSchema.statics.like = async function(userId, targetType, targetId) {
  // 检查是否已点赞
  const existingLike = await this.findOne({ user: userId, targetType, targetId });
  if (existingLike) {
    throw new Error('已经点过赞了');
  }

  // 创建点赞记录
  const like = await this.create({ user: userId, targetType, targetId });

  // 更新目标的数量
  if (targetType === 'post') {
    const Post = mongoose.model('Post');
    await Post.updateLikeCount(targetId, 1);
  } else if (targetType === 'comment') {
    const Comment = mongoose.model('Comment');
    await Comment.updateLikeCount(targetId, 1);
  }

  return like;
};

// 静态方法：取消点赞
likeSchema.statics.unlike = async function(userId, targetType, targetId) {
  // 查找点赞记录
  const like = await this.findOneAndDelete({ user: userId, targetType, targetId });

  if (!like) {
    throw new Error('还没有点赞');
  }

  // 更新目标的数量
  if (targetType === 'post') {
    const Post = mongoose.model('Post');
    await Post.updateLikeCount(targetId, -1);
  } else if (targetType === 'comment') {
    const Comment = mongoose.model('Comment');
    await Comment.updateLikeCount(targetId, -1);
  }

  return like;
};

// 静态方法：获取用户的所有点赞
likeSchema.statics.getUserLikes = async function(userId, targetType, page = 1, limit = 20) {
  const query = { user: userId, targetType };

  const likes = await this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await this.countDocuments(query);

  // 获取目标详情
  const targetIds = likes.map(like => like.targetId);
  let targets = [];

  if (targetType === 'post') {
    const Post = mongoose.model('Post');
    targets = await Post.find({ _id: { $in: targetIds } })
      .populate('author', 'username avatar')
      .populate('category', 'name slug');
  } else if (targetType === 'comment') {
    const Comment = mongoose.model('Comment');
    targets = await Comment.find({ _id: { $in: targetIds } })
      .populate('author', 'username avatar');
  }

  return {
    likes,
    targets,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
