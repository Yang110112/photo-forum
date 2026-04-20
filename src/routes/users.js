/**
 * 用户路由 - User Routes
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

/**
 * @route   GET /api/v1/users/me
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/me', protect, userController.getMe);

/**
 * @route   PUT /api/v1/users/me
 * @desc    更新当前用户信息
 * @access  Private
 */
router.put(
  '/me',
  protect,
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('用户名需3-20个字符')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('用户名只能包含字母、数字和下划线'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('个人简介最多200个字符'),
    body('avatar')
      .optional()
      .trim()
      .isURL()
      .withMessage('头像必须是有效的URL')
  ],
  validate,
  userController.updateMe
);

/**
 * @route   PUT /api/v1/users/me/password
 * @desc    修改密码
 * @access  Private
 */
router.put(
  '/me/password',
  protect,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('当前密码不能为空'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('新密码至少6个字符')
  ],
  validate,
  userController.updatePassword
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    获取用户详情
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('无效的用户ID')
  ],
  validate,
  userController.getUserById
);

/**
 * @route   GET /api/v1/users
 * @desc    获取用户列表
 * @access  Public
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('每页数量需在1-50之间')
  ],
  validate,
  userController.getUsers
);

module.exports = router;
