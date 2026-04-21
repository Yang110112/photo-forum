/**
 * 收藏控制器 - Favorite Controller
 */

const Favorite = require('../models/Favorite');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    获取我的收藏列表
 */
exports.getMyFavorites = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await Favorite.getUserFavorites(
      req.user._id,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      status: 'success',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    添加收藏
 */
exports.addFavorite = async (req, res, next) => {
  try {
    const { post } = req.body;

    const favorite = await Favorite.addFavorite(req.user._id, post);

    res.status(201).json({
      status: 'success',
      message: '收藏成功',
      data: { favorite }
    });
  } catch (error) {
    if (error.message === '已经收藏过了') {
      return next(new AppError('已经收藏过了', 400));
    }
    if (error.message === '帖子不存在') {
      return next(new AppError('帖子不存在', 404));
    }
    next(error);
  }
};

/**
 * @desc    取消收藏
 */
exports.removeFavorite = async (req, res, next) => {
  try {
    const { postId } = req.params;

    await Favorite.removeFavorite(req.user._id, postId);

    res.status(200).json({
      status: 'success',
      message: '取消收藏成功'
    });
  } catch (error) {
    if (error.message === '还没有收藏') {
      return next(new AppError('还没有收藏', 400));
    }
    next(error);
  }
};

/**
 * @desc    检查是否已收藏
 */
exports.checkFavorite = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const isFavorited = await Favorite.isFavorited(req.user._id, postId);

    res.status(200).json({
      status: 'success',
      data: { isFavorited }
    });
  } catch (error) {
    next(error);
  }
};
