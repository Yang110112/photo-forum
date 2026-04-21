/**
 * 认证路由 - Authentication Routes
 */

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    用户注册
 * @access  Public
 */
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('用户名需3-20个字符')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('用户名只能包含字母、数字和下划线'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('请输入有效的邮箱地址')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('密码至少6个字符')
  ],
  validate,
  authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    用户登录
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('请输入有效的邮箱地址')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('密码不能为空')
  ],
  validate,
  authController.login
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    用户登出
 * @access  Private
 */
router.post('/logout', protect, authController.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/me', protect, authController.getMe);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    刷新Token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

module.exports = router;
