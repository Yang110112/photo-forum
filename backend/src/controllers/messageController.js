/**
 * 私信控制器 - Private Message Controller
 */

const PrivateMessage = require('../models/PrivateMessage');
const Friendship = require('../models/Friendship');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    发送私信
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!content || !content.trim()) {
      return next(new AppError('消息内容不能为空', 400));
    }

    // 检查是否为好友关系
    const areFriends = await Friendship.areFriends(senderId, receiverId);
    if (!areFriends) {
      return next(new AppError('只能给好友发送私信', 400));
    }

    const conversationId = PrivateMessage.generateConversationId(senderId, receiverId);

    const message = await PrivateMessage.create({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      content: content.trim()
    });

    await message.populate('sender', 'username avatar');

    res.status(201).json({
      status: 'success',
      message: '消息发送成功',
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取会话消息列表
 */
exports.getConversation = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 50 } = req.query;

    const conversationId = PrivateMessage.generateConversationId(userId, friendId);

    // 标记未读消息为已读
    await PrivateMessage.updateMany(
      {
        conversationId,
        sender: friendId,
        receiver: userId,
        isRead: false
      },
      { isRead: true }
    );

    const messages = await PrivateMessage.find({ conversationId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取会话列表（最近聊天）
 */
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 查找所有涉及当前用户的最新消息
    const conversations = await PrivateMessage.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$content' },
          lastTime: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $sort: { lastTime: -1 }
      }
    ]);

    // 获取每个会话的对方用户信息
    const conversationsWithUser = await Promise.all(conversations.map(async (conv) => {
      // 从 conversationId 解析出两个用户ID
      const userIds = conv._id.split('_');
      const friendId = userIds[0] === userId.toString() ? userIds[1] : userIds[0];

      const user = await require('../models/User').findById(friendId).select('username avatar bio');
      if (!user) return null;

      return {
        conversationId: conv._id,
        friend: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio
        },
        lastMessage: conv.lastMessage,
        lastTime: conv.lastTime,
        unreadCount: conv.unreadCount
      };
    }));

    // 过滤掉已删除的用户
    const validConversations = conversationsWithUser.filter(c => c !== null);

    res.status(200).json({
      status: 'success',
      data: { conversations: validConversations }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取未读消息总数
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await PrivateMessage.aggregate([
      {
        $match: {
          receiver: userId,
          isRead: false
        }
      },
      {
        $group: {
          _id: '$conversationId',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalUnread: { $sum: '$count' },
          conversationCount: { $sum: 1 }
        }
      }
    ]);

    const data = result.length > 0
      ? { totalUnread: result[0].totalUnread, conversationCount: result[0].conversationCount }
      : { totalUnread: 0, conversationCount: 0 };

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};
