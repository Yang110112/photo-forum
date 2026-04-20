/**
 * 分类控制器 - Category Controller
 */

const Category = require('../models/Category');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    获取分类列表
 */
exports.getCategories = async (req, res, next) => {
  try {
    const { includeInactive = false } = req.query;

    const categories = await Category.getAllCategories(includeInactive === 'true');

    res.status(200).json({
      status: 'success',
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    根据slug获取分类
 */
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await Category.getCategoryBySlug(slug);

    if (!category) {
      return next(new AppError('分类不存在', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    创建分类
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon, order } = req.body;

    // 检查slug是否已存在
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return next(new AppError('该slug已被使用', 400));
    }

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      icon: icon || 'folder',
      order: order || 0
    });

    res.status(201).json({
      status: 'success',
      message: '分类创建成功',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新分类
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, order, isActive } = req.body;

    // 检查分类是否存在
    const category = await Category.findById(id);
    if (!category) {
      return next(new AppError('分类不存在', 404));
    }

    // 检查新slug是否被其他分类使用
    if (slug && slug !== category.slug) {
      const existingSlug = await Category.findOne({ slug });
      if (existingSlug) {
        return next(new AppError('该slug已被其他分类使用', 400));
      }
    }

    // 更新分类
    const updateFields = {};
    if (name) updateFields.name = name;
    if (slug) updateFields.slug = slug;
    if (description !== undefined) updateFields.description = description;
    if (icon) updateFields.icon = icon;
    if (order !== undefined) updateFields.order = order;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: '分类更新成功',
      data: { category: updatedCategory }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    删除分类
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return next(new AppError('分类不存在', 404));
    }

    // 检查该分类下是否有帖子
    if (category.postCount > 0) {
      return next(new AppError('该分类下还有帖子，无法删除', 400));
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: '分类删除成功'
    });
  } catch (error) {
    next(error);
  }
};
