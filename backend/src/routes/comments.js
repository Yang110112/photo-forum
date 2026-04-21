/**
 * 评论路由 - Comment Routes
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

/**
 * @route   POST /api/v1/comments
 * @desc    创建评论
 * @access  Private
 */
router.post(
  '/',
  protect,
  [
    body('content')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('评论内容需1-2000个字符'),
    body('post')
      .isMongoId()
      .withMessage('无效的帖子ID'),
    body('parent')
      .optional()
      .isMongoId()
      .withMessage('无效的评论ID')
  ],
  validate,
  commentController.createComment
);

/**
 * @route   DELETE /api/v1/comments/:id
 * @desc    删除评论
 * @access  Private
 */
router.delete(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('无效的评论ID')
  ],
  validate,
  commentController.deleteComment
);

/**
 * @route   POST /api/v1/comments/:id/like
 * @desc    点赞评论
 * @access  Private
 */
router.post(
  '/:id/like',
  protect,
  [
    param('id').isMongoId().withMessage('无效的评论ID')
  ],
  validate,
  commentController.likeComment
);

/**
 * @route   DELETE /api/v1/comments/:id/like
 * @desc    取消点赞
 * @access  Private
 */
router.delete(
  '/:id/like',
  protect,
  [
    param('id').isMongoId().withMessage('无效的评论ID')
  ],
  validate,
  commentController.unlikeComment
);

module.exports = router;
