/**
 * 关注关系路由 - Follow Routes
 */

const express = require('express');
const followController = require('../controllers/followController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 所有关注路由都需要登录
router.use(protect);

/**
 * @route   POST /api/v1/follows/:userId
 * @desc    关注用户
 * @access  Private
 */
router.post('/:userId', followController.followUser);

/**
 * @route   DELETE /api/v1/follows/:userId
 * @desc    取消关注
 * @access  Private
 */
router.delete('/:userId', followController.unfollowUser);

/**
 * @route   GET /api/v1/follows/following
 * @desc    获取关注列表
 * @access  Private
 */
router.get('/following', followController.getFollowing);

/**
 * @route   GET /api/v1/follows/followers
 * @desc    获取粉丝列表
 * @access  Private
 */
router.get('/followers', followController.getFollowers);

/**
 * @route   GET /api/v1/follows/user/:userId/stats
 * @desc    获取关注/粉丝统计
 * @access  Private
 */
router.get('/user/:userId/stats', followController.getFollowStats);

module.exports = router;
