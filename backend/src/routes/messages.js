/**
 * 私信路由 - Message Routes
 */

const express = require('express');
const { body, param } = require('express-validator');
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

// 所有私信路由都需要登录
router.use(protect);

/**
 * @route   POST /api/v1/messages
 * @desc    发送私信
 * @access  Private
 */
router.post(
  '/',
  [
    body('receiverId').isMongoId().withMessage('无效的接收者ID'),
    body('content').trim().notEmpty().withMessage('消息内容不能为空').isLength({ max: 2000 }).withMessage('消息最多2000个字符')
  ],
  validate,
  messageController.sendMessage
);

/**
 * @route   GET /api/v1/messages/conversations
 * @desc    获取会话列表
 * @access  Private
 */
router.get('/conversations', messageController.getConversations);

/**
 * @route   GET /api/v1/messages/unread
 * @desc    获取未读消息总数
 * @access  Private
 */
router.get('/unread', messageController.getUnreadCount);

/**
 * @route   POST /api/v1/messages/broadcast
 * @desc    系统官方一键广播通知所有用户
 * @access  Private (仅系统官方账号)
 */
router.post(
  '/broadcast',
  [
    body('content').trim().notEmpty().withMessage('通知内容不能为空').isLength({ max: 5000 }).withMessage('通知内容不能超过5000个字符'),
    body('title').optional().trim().isLength({ max: 100 }).withMessage('标题不能超过100个字符')
  ],
  validate,
  messageController.broadcastMessage
);

/**
 * @route   GET /api/v1/messages/broadcast/history
 * @desc    获取广播历史记录（仅系统官方）
 * @access  Private (仅系统官方账号)
 */
router.get('/broadcast/history', messageController.getBroadcastHistory);

/**
 * @route   GET /api/v1/messages/:friendId
 * @desc    获取与某好友的会话消息
 * @access  Private
 */
router.get('/:friendId', messageController.getConversation);

module.exports = router;
