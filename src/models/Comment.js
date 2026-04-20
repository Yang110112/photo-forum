/**
 * 评论模型 - Comment Model
 * 论坛帖子的评论数据结构
 */

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, '评论内容不能为空'],
    trim: true,
    minlength: [1, '评论至少1个字符'],
    maxlength: [2000, '评论最多2000个字符']
  },
  author: {
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
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  replyCount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 复合索引
commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ parent: 1, createdAt: 1 });

// 虚拟字段：是否已点赞
commentSchema.virtual('isLiked').get(function() {
  return this._isLiked || false;
});

// 虚拟字段：是否是回复
commentSchema.virtual('isReply').get(function() {
  return this.parent !== null;
});

commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

// 静态方法：获取帖子的所有评论（树形结构）
commentSchema.statics.getCommentsByPost = async function(postId, page = 1, limit = 20) {
  // 先获取一级评论
  const query = { post: postId, parent: null, status: 'active' };

  const comments = await this.find(query)
    .populate('author', 'username avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // 获取每个一级评论的回复
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replies = await this.find({
        post: postId,
        parent: comment._id,
        status: 'active'
      })
        .populate('author', 'username avatar')
        .sort({ createdAt: 1 });

      return {
        ...comment.toObject(),
        replies
      };
    })
  );

  const total = await this.countDocuments(query);

  return {
    comments: commentsWithReplies,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// 静态方法：获取评论的所有回复
commentSchema.statics.getReplies = async function(commentId, limit = 10) {
  return this.find({ parent: commentId, status: 'active' })
    .populate('author', 'username avatar')
    .sort({ createdAt: 1 })
    .limit(limit);
};

// 静态方法：获取用户的评论列表
commentSchema.statics.getCommentsByUser = async function(userId, page = 1, limit = 20) {
  const query = { author: userId, status: 'active' };

  const comments = await this.find(query)
    .populate('post', 'title')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// 静态方法：更新回复数
commentSchema.statics.updateReplyCount = async function(commentId, increment = 1) {
  return this.findByIdAndUpdate(
    commentId,
    { $inc: { replyCount: increment } },
    { new: true }
  );
};

// 静态方法：更新点赞数
commentSchema.statics.updateLikeCount = async function(commentId, increment = 1) {
  return this.findByIdAndUpdate(
    commentId,
    { $inc: { likeCount: increment } },
    { new: true }
  );
};

// 静态方法：软删除评论
commentSchema.statics.softDelete = async function(commentId) {
  return this.findByIdAndUpdate(
    commentId,
    { status: 'deleted', content: '[已删除]' },
    { new: true }
  );
};

// 实例方法：软删除
commentSchema.methods.softDelete = async function() {
  this.status = 'deleted';
  this.content = '[已删除]';
  return this.save();
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
