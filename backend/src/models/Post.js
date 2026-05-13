/**
 * 帖子模型 - Post Model
 * 论坛帖子的数据结构
 */

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '标题不能为空'],
    trim: true,
    minlength: [5, '标题至少5个字符'],
    maxlength: [200, '标题最多200个字符']
  },
  content: {
    type: String,
    required: [true, '内容不能为空'],
    minlength: [10, '内容至少10个字符']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, '分类不能为空'],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
   media: [{
    url: { type: String },
    type: { type: String },
    name: { type: String }
  }],
  images: [{
    type: String,
    trim: true
  }],
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  commentCount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'deleted'],
    default: 'published',
    index: true
  },
  openForBooking: { type: Boolean, default: false },
  bookingLocation: { type: String, default: '' },
  bookingDuration: { type: String, default: '' },
  bookingFee: { type: String, default: '' },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 复合索引
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

// 文本索引（用于搜索）
postSchema.index({ title: 'text', content: 'text' });

// 虚拟字段：是否已点赞（需要外部传入）
postSchema.virtual('isLiked').get(function() {
  return this._isLiked || false;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// 静态方法：获取帖子列表（带分页和筛选）
postSchema.statics.getPosts = async function(options = {}) {
  const {
    page = 1,
    limit = 10,
    category,
    author,
    tag,
    keyword,
    sortBy = 'createdAt',
    order = 'desc',
    status = 'published'
  } = options;

  const query = { status, isDeleted: false };

  // 筛选条件
  if (category) query.category = category;
  if (author) query.author = author;
  if (tag) query.tags = tag;
  if (keyword) {
    query.$text = { $search: keyword };
  }

  // 排序
  const sortOrder = order === 'desc' ? -1 : 1;
  const sort = sortBy === 'likeCount' ? { likeCount: sortOrder } :
               sortBy === 'viewCount' ? { viewCount: sortOrder } :
               { createdAt: sortOrder };

  const posts = await this.find(query)
    .populate('author', 'username avatar certStatus')
    .populate('category', 'name slug')
    .select('-isDeleted')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// 静态方法：获取热门帖子
postSchema.statics.getHotPosts = function(limit = 10) {
  return this.find({ status: 'published', isDeleted: false })
    .populate('author', 'username avatar certStatus')
    .populate('category', 'name slug')
    .select('-isDeleted')
    .sort({ likeCount: -1, viewCount: -1 })
    .limit(limit);
};

// 静态方法：更新评论数
postSchema.statics.updateCommentCount = async function(postId, increment = 1) {
  return this.findByIdAndUpdate(
    postId,
    { $inc: { commentCount: increment } },
    { new: true }
  );
};

// 静态方法：更新点赞数
postSchema.statics.updateLikeCount = async function(postId, increment = 1) {
  return this.findByIdAndUpdate(
    postId,
    { $inc: { likeCount: increment } },
    { new: true }
  );
};

// 实例方法：增加浏览量
postSchema.methods.incrementView = async function() {
  this.viewCount += 1;
  return this.save();
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
