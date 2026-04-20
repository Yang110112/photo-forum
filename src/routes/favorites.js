/**
 * 收藏路由 - Favorite Routes
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

/**
 * @route   GET /api/v1/favorites
 * @desc    获取我的收藏列表
 * @access  Private
 */
router.get(
  '/',
  protect,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('每页数量需在1-50之间')
  ],
  validate,
  favoriteController.getMyFavorites
);

/**
 * @route   POST /api/v1/favorites
 * @desc    添加收藏
 * @access  Private
 */
router.post(
  '/',
  protect,
  [
    body('post')
      .isMongoId()
      .withMessage('无效的帖子ID')
  ],
  validate,
  favoriteController.addFavorite
);

/**
 * @route   DELETE /api/v1/favorites/:postId
 * @desc    取消收藏
 * @access  Private
 */
router.delete(
  '/:postId',
  protect,
  [
    param('postId').isMongoId().withMessage('无效的帖子ID')
  ],
  validate,
  favoriteController.removeFavorite
);

/**
 * @route   GET /api/v1/favorites/check/:postId
 * @desc    检查是否已收藏
 * @access  Private
 */
router.get(
  '/check/:postId',
  protect,
  [
    param('postId').isMongoId().withMessage('无效的帖子ID')
  ],
  validate,
  favoriteController.checkFavorite
);

module.exports = router;
