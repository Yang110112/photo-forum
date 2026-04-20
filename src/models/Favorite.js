/**
 * 收藏模型 - Favorite Model
 * 用户收藏的帖子记录
 */

const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// 复合唯一索引：同一用户只能收藏同一帖子一次
favoriteSchema.index({ user: 1, post: 1 }, { unique: true });

// 静态方法：检查是否已收藏
favoriteSchema.statics.isFavorited = async function(userId, postId) {
  const favorite = await this.findOne({ user: userId, post: postId });
  return !!favorite;
};

// 静态方法：添加收藏
favoriteSchema.statics.addFavorite = async function(userId, postId) {
  // 检查是否已收藏
  const existing = await this.findOne({ user: userId, post: postId });
  if (existing) {
    throw new Error('已经收藏过了');
  }

  // 检查帖子是否存在
  const Post = mongoose.model('Post');
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('帖子不存在');
  }

  // 创建收藏记录
  const favorite = await this.create({ user: userId, post: postId });

  return favorite;
};

// 静态方法：取消收藏
favoriteSchema.statics.removeFavorite = async function(userId, postId) {
  const favorite = await this.findOneAndDelete({ user: userId, post: postId });

  if (!favorite) {
    throw new Error('还没有收藏');
  }

  return favorite;
};

// 静态方法：获取用户的收藏列表
favoriteSchema.statics.getUserFavorites = async function(userId, page = 1, limit = 10) {
  const query = { user: userId };

  const favorites = await this.find(query)
    .populate({
      path: 'post',
      match: { isDeleted: false, status: 'published' },
      populate: [
        { path: 'author', select: 'username avatar' },
        { path: 'category', select: 'name slug' }
      ]
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // 过滤掉已被删除的帖子
  const validFavorites = favorites.filter(f => f.post !== null);

  const total = await this.countDocuments(query);

  return {
    favorites: validFavorites,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// 静态方法：获取帖子的收藏数
favoriteSchema.statics.getPostFavoriteCount = async function(postId) {
  return this.countDocuments({ post: postId });
};

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
