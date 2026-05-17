/**
 * 好友关系路由 - Friend Routes
 */

const express = require('express');
const { body, param } = require('express-validator');
const friendController = require('../controllers/friendController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

// 所有好友路由都需要登录
router.use(protect);

/**
 * @route   POST /api/v1/friends/request
 * @desc    发送好友请求
 * @access  Private
 */
router.post(
  '/request',
  [
    body('toUserId').isMongoId().withMessage('无效的用户ID'),
    body('message').optional().trim().isLength({ max: 200 }).withMessage('附言最多200个字符')
  ],
  validate,
  friendController.sendFriendRequest
);

/**
 * @route   PUT /api/v1/friends/request/:requestId/accept
 * @desc    接受好友请求
 * @access  Private
 */
router.put('/request/:requestId/accept', friendController.acceptFriendRequest);

/**
 * @route   PUT /api/v1/friends/request/:requestId/reject
 * @desc    拒绝好友请求
 * @access  Private
 */
router.put('/request/:requestId/reject', friendController.rejectFriendRequest);

/**
 * @route   GET /api/v1/friends
 * @desc    获取好友列表
 * @access  Private
 */
router.get('/', friendController.getFriends);

/**
 * @route   GET /api/v1/friends/requests
 * @desc    获取待处理的好友请求
 * @access  Private
 */
router.get('/requests', friendController.getPendingRequests);

/**
 * @route   GET /api/v1/friends/search
 * @desc    搜索用户
 * @access  Private
 */
router.get('/search', friendController.searchUsers);

/**
 * @route   GET /api/v1/friends/:userId/status
 * @desc    获取与某用户的好友状态
 * @access  Private
 */
router.get('/:userId/status', friendController.getFriendStatus);

/**
 * @route   DELETE /api/v1/friends/:friendId
 * @desc    删除好友
 * @access  Private
 */
router.delete('/:friendId', friendController.removeFriend);

module.exports = router;
