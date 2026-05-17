/**
 * 关注关系控制器 - Follow Controller
 */

const Follow = require('../models/Follow');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    关注用户
 */
exports.followUser = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user._id;

    if (currentUserId.toString() === targetUserId) {
      return next(new AppError('不能关注自己', 400));
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return next(new AppError('用户不存在', 404));
    }

    const follow = await Follow.create({
      follower: currentUserId,
      following: targetUserId
    });

    res.status(201).json({
      status: 'success',
      message: '关注成功',
      data: { follow }
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('已经关注了该用户', 400));
    }
    next(error);
  }
};

/**
 * @desc    取消关注
 */
exports.unfollowUser = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user._id;

    const result = await Follow.deleteOne({
      follower: currentUserId,
      following: targetUserId
    });

    if (result.deletedCount === 0) {
      return next(new AppError('未关注该用户', 404));
    }

    res.status(200).json({
      status: 'success',
      message: '已取消关注'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取关注列表（我关注了谁）
 */
exports.getFollowing = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user._id;

    const follows = await Follow.find({ follower: userId })
      .populate('following', 'username avatar bio certStatus')
      .sort({ createdAt: -1 });

    const following = follows.map(f => f.following);

    res.status(200).json({
      status: 'success',
      data: { following }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取粉丝列表（谁关注了我）
 */
exports.getFollowers = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user._id;

    const follows = await Follow.find({ following: userId })
      .populate('follower', 'username avatar bio certStatus')
      .sort({ createdAt: -1 });

    const followers = follows.map(f => f.follower);

    res.status(200).json({
      status: 'success',
      data: { followers }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取关注/粉丝统计
 */
exports.getFollowStats = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user._id;

    const [followingCount, followersCount] = await Promise.all([
      Follow.countDocuments({ follower: targetUserId }),
      Follow.countDocuments({ following: targetUserId })
    ]);

    // 检查当前用户是否关注了目标用户
    let isFollowing = false;
    if (currentUserId.toString() !== targetUserId) {
      isFollowing = !!(await Follow.findOne({
        follower: currentUserId,
        following: targetUserId
      }));
    }

    res.status(200).json({
      status: 'success',
      data: {
        followingCount,
        followersCount,
        isFollowing
      }
    });
  } catch (error) {
    next(error);
  }
};
