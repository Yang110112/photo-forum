/**
 * 帖子控制器 - Post Controller
 */

const Post = require('../models/Post');
const Like = require('../models/Like');
const Favorite = require('../models/Favorite');
const Category = require('../models/Category');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    创建帖子
 */
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags, images, openForBooking, bookingLocation, bookingDuration, bookingFee } = req.body;

    // 验证分类（支持 ObjectId 和 slug）
    let categoryDoc;
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      categoryDoc = await Category.findById(category);
    } else {
      categoryDoc = await Category.findOne({ slug: category });
    }
    if (!categoryDoc) {
      return next(new AppError('分类不存在', 404));
    }

    // 只有认证摄影师才能开启约拍
    const canOpenBooking = req.user.certStatus === 'approved' && openForBooking === true;

    // 创建帖子
    const post = await Post.create({
    title,
    content,
    category: categoryDoc._id,
    tags: tags || [],
    images: images || [],
    author: req.user._id,
    openForBooking: openForBooking || false,
    bookingLocation: bookingLocation || '',
    bookingDuration: bookingDuration || '',
    bookingFee: bookingFee || '',
  });

    // 更新分类帖子数
    await Category.updatePostCount(categoryDoc._id, 1);

    // 填充关联数据
    await post.populate('author', 'username avatar');
    await post.populate('category', 'name slug');

    res.status(201).json({
      status: 'success',
      message: '帖子创建成功',
      data: { post }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取帖子列表
 */
exports.getPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      author,
      tag,
      keyword,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      author,
      tag,
      keyword,
      sortBy,
      order
    };

    const result = await Post.getPosts(options);

    // 如果用户已登录，检查点赞状态
    if (req.user) {
      const postIds = result.posts.map(post => post._id);
      const likes = await Like.find({
        user: req.user._id,
        targetType: 'post',
        targetId: { $in: postIds }
      });
      const likedIds = new Set(likes.map(like => like.targetId.toString()));

      result.posts = result.posts.map(post => ({
        ...post.toObject(),
        isLiked: likedIds.has(post._id.toString())
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
 * @desc    获取热门帖子
 */
exports.getHotPosts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const posts = await Post.getHotPosts(parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取单个帖子
 */
exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('author', 'username avatar bio certStatus')
      .populate('category', 'name slug');

    if (!post) {
      return next(new AppError('帖子不存在', 404));
    }

    if (post.status !== 'published' && !req.user) {
      return next(new AppError('帖子不存在', 404));
    }

    // 增加浏览量
    await post.incrementView();

    // 检查点赞状态
    let isLiked = false;
    let isFavorited = false;

    if (req.user) {
      isLiked = await Like.isLiked(req.user._id, 'post', post._id);
      isFavorited = await Favorite.isFavorited(req.user._id, post._id);
    }

    res.status(200).json({
      status: 'success',
      data: {
        post: {
          ...post.toObject(),
          isLiked,
          isFavorited
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新帖子
 */
exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, status } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return next(new AppError('帖子不存在', 404));
    }

    // 检查权限：作者或管理员
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('没有权限修改此帖子', 403));
    }

    // 如果修改了分类
    if (category && category !== post.category.toString()) {
      // 减少原分类计数
      await Category.updatePostCount(post.category, -1);
      // 增加新分类计数
      await Category.updatePostCount(category, 1);
    }

    // 更新帖子
    const updateFields = {};
    if (title) updateFields.title = title;
    if (content) updateFields.content = content;
    if (category) updateFields.category = category;
    if (tags) updateFields.tags = tags;
    if (status && req.user.role === 'admin') updateFields.status = status;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate('author', 'username avatar')
      .populate('category', 'name slug');

    res.status(200).json({
      status: 'success',
      message: '帖子更新成功',
      data: { post: updatedPost }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    删除帖子
 */
exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return next(new AppError('帖子不存在', 404));
    }

    // 检查权限：作者或管理员
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('没有权限删除此帖子', 403));
    }

    // 删除帖子
    await Post.findByIdAndDelete(id);

    // 更新分类计数
    await Category.updatePostCount(post.category, -1);

    res.status(200).json({
      status: 'success',
      message: '帖子删除成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    点赞帖子
 */
exports.likePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查帖子是否存在
    const post = await Post.findById(id);
    if (!post) {
      return next(new AppError('帖子不存在', 404));
    }

    // 点赞
    await Like.like(req.user._id, 'post', post._id);

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
 * @desc    取消点赞
 */
exports.unlikePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 取消点赞
    await Like.unlike(req.user._id, 'post', id);

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
