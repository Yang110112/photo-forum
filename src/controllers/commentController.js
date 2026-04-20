/**
 * 评论控制器 - Comment Controller
 */

const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Like = require('../models/Like');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    创建评论
 */
exports.createComment = async (req, res, next) => {
  try {
    const { content, post, parent } = req.body;

    // 检查帖子是否存在
    const postExists = await Post.findById(post);
    if (!postExists) {
      return next(new AppError('帖子不存在', 404));
    }

    // 如果是回复，检查父评论是否存在
    if (parent) {
      const parentComment = await Comment.findById(parent);
      if (!parentComment) {
        return next(new AppError('父评论不存在', 404));
      }
      if (parentComment.post.toString() !== post) {
        return next(new AppError('父评论不属于该帖子', 400));
      }
    }

    const comment = await Comment.create({
      content,
      post,
      parent: parent || null,
      author: req.user._id
    });

    // 更新帖子的评论数
    await Post.updateCommentCount(post, 1);

    // 如果是回复，更新父评论的回复数
    if (parent) {
      await Comment.updateReplyCount(parent, 1);
    }

    // 填充用户信息
    await comment.populate('author', 'username avatar');

    res.status(201).json({
      status: 'success',
      message: '评论创建成功',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取帖子的评论
 */
exports.getCommentsByPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // 检查帖子是否存在
    const post = await Post.findById(id);
    if (!post) {
      return next(new AppError('帖子不存在', 404));
    }

    const result = await Comment.getCommentsByPost(id, parseInt(page), parseInt(limit));

    // 如果用户已登录，检查点赞状态
    if (req.user) {
      const commentIds = result.comments.flatMap(c => [
        c._id,
        ...(c.replies?.map(r => r._id) || [])
      ]);

      const likes = await Like.find({
        user: req.user._id,
        targetType: 'comment',
        targetId: { $in: commentIds }
      });
      const likedIds = new Set(likes.map(like => like.targetId.toString()));

      result.comments = result.comments.map(comment => ({
        ...comment,
        isLiked: likedIds.has(comment._id.toString()),
        replies: comment.replies?.map(reply => ({
          ...reply.toObject(),
          isLiked: likedIds.has(reply._id.toString())
        }))
      }));
    }

    res.status(200).json({
      status: 'success',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    删除评论
 */
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return next(new AppError('评论不存在', 404));
    }

    // 检查权限：作者、管理员或帖子作者
    const post = await Post.findById(comment.post);
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isPostAuthor = post.author.toString() === req.user._id.toString();

    if (!isAuthor && !isAdmin && !isPostAuthor) {
      return next(new AppError('没有权限删除此评论', 403));
    }

    // 软删除
    await comment.softDelete();

    // 更新帖子评论数
    await Post.updateCommentCount(comment.post, -1);

    // 如果是回复，更新父评论的回复数
    if (comment.parent) {
      await Comment.updateReplyCount(comment.parent, -1);
    }

    res.status(200).json({
      status: 'success',
      message: '评论删除成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    点赞评论
 */
exports.likeComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查评论是否存在
    const comment = await Comment.findById(id);
    if (!comment) {
      return next(new AppError('评论不存在', 404));
    }

    // 点赞
    await Like.like(req.user._id, 'comment', comment._id);

    res.status(200).json({
      status: 'success',
      message: '点赞成功'
    });
  } catch (error) {
    if (error.message === '已经点过赞了') {
      return next(new AppError('已经点过赞了', 400));
    }
    next(error);
  }
};

/**
 * @desc    取消点赞评论
 */
exports.unlikeComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 取消点赞
    await Like.unlike(req.user._id, 'comment', id);

    res.status(200).json({
      status: 'success',
      message: '取消点赞成功'
    });
  } catch (error) {
    if (error.message === '还没有点赞') {
      return next(new AppError('还没有点赞', 400));
    }
    next(error);
  }
};
