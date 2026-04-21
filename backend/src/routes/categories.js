/**
 * 分类路由 - Category Routes
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

/**
 * @route   GET /api/v1/categories
 * @desc    获取分类列表
 * @access  Public
 */
router.get(
  '/',
  [
    query('includeInactive').optional().isBoolean().withMessage('无效的参数')
  ],
  validate,
  categoryController.getCategories
);

/**
 * @route   GET /api/v1/categories/:slug
 * @desc    根据slug获取分类
 * @access  Public
 */
router.get(
  '/:slug',
  [
    param('slug').trim().notEmpty().withMessage('slug不能为空')
  ],
  validate,
  categoryController.getCategoryBySlug
);

/**
 * @route   POST /api/v1/categories
 * @desc    创建分类
 * @access  Private (Admin)
 */
router.post(
  '/',
  protect,
  admin,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 20 })
      .withMessage('分类名称需2-20个字符'),
    body('slug')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('slug需2-50个字符')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('slug只能包含小写字母、数字和连字符'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('分类描述最多200个字符'),
    body('icon')
      .optional()
      .trim(),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('排序必须为非负整数')
  ],
  validate,
  categoryController.createCategory
);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    更新分类
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  protect,
  admin,
  [
    param('id').isMongoId().withMessage('无效的分类ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 20 })
      .withMessage('分类名称需2-20个字符'),
    body('slug')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('slug需2-50个字符')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('slug只能包含小写字母、数字和连字符'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('分类描述最多200个字符'),
    body('icon')
      .optional()
      .trim(),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('排序必须为非负整数')
  ],
  validate,
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    删除分类
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  protect,
  admin,
  [
    param('id').isMongoId().withMessage('无效的分类ID')
  ],
  validate,
  categoryController.deleteCategory
);

module.exports = router;
