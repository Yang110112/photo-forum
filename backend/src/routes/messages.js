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
 * @route   GET /api/v1/messages/:friendId
 * @desc    获取与某好友的会话消息
 * @access  Private
 */
router.get('/:friendId', messageController.getConversation);

module.exports = router;
