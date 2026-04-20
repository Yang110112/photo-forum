/**
 * 帖子路由 - Post Routes
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { protect, optionalAuth, admin } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

// 帖子评论路由
router.get(
  '/:id/comments',
  [
    param('id').isMongoId().withMessage('无效的帖子ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('每页数量需在1-50之间')
  ],
  validate,
  commentController.getCommentsByPost
);

/**
 * @route   POST /api/v1/posts
 * @desc    创建帖子
 * @access  Private
 */
router.post(
  '/',
  protect,
  [
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('标题需5-200个字符'),
    body('content')
      .trim()
      .isLength({ min: 10 })
      .withMessage('内容至少10个字符'),
    body('category')
      .isMongoId()
      .withMessage('无效的分类ID'),
    body('tags')
      .optional()
      .isArray({ max: 5 })
      .withMessage('最多5个标签')
  ],
  validate,
  postController.createPost
);

/**
 * @route   GET /api/v1/posts
 * @desc    获取帖子列表
 * @access  Public
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('每页数量需在1-50之间'),
    query('category').optional().isMongoId().withMessage('无效的分类ID'),
    query('author').optional().isMongoId().withMessage('无效的用户ID'),
    query('sortBy').optional().isIn(['createdAt', 'likeCount', 'viewCount']).withMessage('无效的排序字段'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('无效的排序方向')
  ],
  validate,
  postController.getPosts
);

/**
 * @route   GET /api/v1/posts/hot
 * @desc    获取热门帖子
 * @access  Public
 */
router.get('/hot', postController.getHotPosts);

/**
 * @route   GET /api/v1/posts/:id
 * @desc    获取帖子详情
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('无效的帖子ID')
  ],
  validate,
  postController.getPostById
);

/**
 * @route   PUT /api/v1/posts/:id
 * @desc    更新帖子
 * @access  Private (作者或管理员)
 */
router.put(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('无效的帖子ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('标题需5-200个字符'),
    body('content')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('内容至少10个字符')
  ],
  validate,
  postController.updatePost
);

/**
 * @route   DELETE /api/v1/posts/:id
 * @desc    删除帖子（软删除）
 * @access  Private (作者或管理员)
 */
router.delete(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('无效的帖子ID')
  ],
  validate,
  postController.deletePost
);

/**
 * @route   POST /api/v1/posts/:id/like
 * @desc    点赞帖子
 * @access  Private
 */
router.post(
  '/:id/like',
  protect,
  [
    param('id').isMongoId().withMessage('无效的帖子ID')
  ],
  validate,
  postController.likePost
);

/**
 * @route   DELETE /api/v1/posts/:id/like
 * @desc    取消点赞
 * @access  Private
 */
router.delete(
  '/:id/like',
  protect,
  [
    param('id').isMongoId().withMessage('无效的帖子ID')
  ],
  validate,
  postController.unlikePost
);

module.exports = router;
