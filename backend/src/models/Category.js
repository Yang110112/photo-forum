/**
 * 分类模型 - Category Model
 * 帖子分类的数据结构
 */

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '分类名称不能为空'],
    unique: true,
    trim: true,
    minlength: [2, '分类名称至少2个字符'],
    maxlength: [20, '分类名称最多20个字符']
  },
  slug: {
    type: String,
    required: [true, '分类slug不能为空'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, '分类描述最多200个字符'],
    default: ''
  },
  icon: {
    type: String,
    default: 'folder'
  },
  order: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
categorySchema.index({ order: 1 });
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1 });

// 静态方法：获取所有分类（排序）
categorySchema.statics.getAllCategories = function(includeInactive = false) {
  const query = includeInactive ? {} : { isActive: true };
  return this.find(query)
    .sort({ order: 1, createdAt: 1 });
};

// 静态方法：获取分类列表（带分页）
categorySchema.statics.getCategories = async function(page = 1, limit = 10) {
  const query = {};

  const categories = await this.find(query)
    .sort({ order: 1, createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    categories,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// 静态方法：更新帖子数
categorySchema.statics.updatePostCount = async function(categoryId, increment = 1) {
  return this.findByIdAndUpdate(
    categoryId,
    { $inc: { postCount: increment } },
    { new: true }
  );
};

// 静态方法：根据slug获取分类
categorySchema.statics.getCategoryBySlug = async function(slug) {
  return this.findOne({ slug, isActive: true });
};

// 实例方法：重置帖子数
categorySchema.methods.resetPostCount = async function() {
  const Post = mongoose.model('Post');
  const count = await Post.countDocuments({
    category: this._id,
    status: 'published',
    isDeleted: false
  });
  this.postCount = count;
  return this.save();
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
