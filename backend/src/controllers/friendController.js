/**
 * 好友关系控制器 - Friend Controller
 */

const Friendship = require('../models/Friendship');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    发送好友请求
 */
exports.sendFriendRequest = async (req, res, next) => {
  try {
    const { toUserId } = req.body;
    const fromUserId = req.user._id;

    // 不能添加自己
    if (fromUserId.toString() === toUserId) {
      return next(new AppError('不能添加自己为好友', 400));
    }

    // 检查目标用户是否存在
    const targetUser = await User.findById(toUserId);
    if (!targetUser) {
      return next(new AppError('用户不存在', 404));
    }

    // 检查是否已存在好友关系
    const existing = await Friendship.findOne({
      $or: [
        { fromUser: fromUserId, toUser: toUserId },
        { fromUser: toUserId, toUser: fromUserId }
      ]
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return next(new AppError('已经是好友了', 400));
      }
      if (existing.status === 'pending') {
        return next(new AppError('已发送过好友请求，请等待对方确认', 400));
      }
      if (existing.status === 'rejected') {
        // 被拒绝后可以重新发送
        existing.status = 'pending';
        existing.fromUser = fromUserId;
        existing.toUser = toUserId;
        existing.message = req.body.message || '';
        await existing.save();
        return res.status(200).json({
          status: 'success',
          message: '好友请求已重新发送',
          data: { friendship: existing }
        });
      }
    }

    // 创建好友请求
    const friendship = await Friendship.create({
      fromUser: fromUserId,
      toUser: toUserId,
      message: req.body.message || ''
    });

    res.status(201).json({
      status: 'success',
      message: '好友请求已发送',
      data: { friendship }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    接受好友请求
 */
exports.acceptFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const friendship = await Friendship.findById(requestId);
    if (!friendship) {
      return next(new AppError('好友请求不存在', 404));
    }

    // 只有接收者才能接受
    if (friendship.toUser.toString() !== req.user._id.toString()) {
      return next(new AppError('无权操作', 403));
    }

    if (friendship.status !== 'pending') {
      return next(new AppError('该请求已处理', 400));
    }

    friendship.status = 'accepted';
    await friendship.save();

    res.status(200).json({
      status: 'success',
      message: '已接受好友请求',
      data: { friendship }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    拒绝好友请求
 */
exports.rejectFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const friendship = await Friendship.findById(requestId);
    if (!friendship) {
      return next(new AppError('好友请求不存在', 404));
    }

    if (friendship.toUser.toString() !== req.user._id.toString()) {
      return next(new AppError('无权操作', 403));
    }

    if (friendship.status !== 'pending') {
      return next(new AppError('该请求已处理', 400));
    }

    friendship.status = 'rejected';
    await friendship.save();

    res.status(200).json({
      status: 'success',
      message: '已拒绝好友请求'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    删除好友
 */
exports.removeFriend = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    const friendship = await Friendship.findOne({
      $or: [
        { fromUser: userId, toUser: friendId },
        { fromUser: friendId, toUser: userId }
      ],
      status: 'accepted'
    });

    if (!friendship) {
      return next(new AppError('不是好友关系', 404));
    }

    // 系统好友不能删除
    if (friendship.isSystem) {
      return next(new AppError('官方好友不能删除', 400));
    }

    await friendship.deleteOne();

    res.status(200).json({
      status: 'success',
      message: '已删除好友'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取好友列表
 */
exports.getFriends = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const friendships = await Friendship.find({
      $or: [{ fromUser: userId }, { toUser: userId }],
      status: 'accepted'
    }).populate('fromUser toUser', 'username avatar bio role').sort({ updatedAt: -1 });

    // 提取好友信息（排除自己）
    const friends = friendships.map(f => {
      const isFromMe = f.fromUser._id.toString() === userId.toString();
      const friend = isFromMe ? f.toUser : f.fromUser;
      return {
        _id: friend._id,
        username: friend.username,
        avatar: friend.avatar,
        bio: friend.bio,
        role: friend.role,
        isSystem: f.isSystem,
        addedAt: f.updatedAt
      };
    });

    res.status(200).json({
      status: 'success',
      data: { friends }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取待处理的好友请求
 */
exports.getPendingRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const requests = await Friendship.find({
      toUser: userId,
      status: 'pending'
    }).populate('fromUser', 'username avatar bio').sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { requests }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    搜索用户（用于添加好友）
 */
exports.searchUsers = async (req, res, next) => {
  try {
    const { keyword, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    if (!keyword) {
      return next(new AppError('请输入搜索关键词', 400));
    }

    const query = {
      _id: { $ne: userId },
      isDeleted: false,
      $or: [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } }
      ]
    };

    const users = await User.find(query)
      .select('username avatar bio')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // 为每个用户附加好友状态
    const usersWithStatus = await Promise.all(users.map(async (u) => {
      const friendship = await Friendship.findOne({
        $or: [
          { fromUser: userId, toUser: u._id },
          { fromUser: u._id, toUser: userId }
        ]
      });

      let friendStatus = 'none'; // none | pending_sent | pending_received | accepted
      if (friendship) {
        if (friendship.status === 'accepted') {
          friendStatus = 'accepted';
        } else if (friendship.status === 'pending') {
          friendStatus = friendship.fromUser.toString() === userId.toString()
            ? 'pending_sent'
            : 'pending_received';
        }
      }

      // 检查关注状态
      const Follow = require('../models/Follow');
      const isFollowing = await Follow.findOne({
        follower: userId,
        following: u._id
      });

      return {
        _id: u._id,
        username: u.username,
        avatar: u.avatar,
        bio: u.bio,
        friendStatus,
        isFollowing: !!isFollowing
      };
    }));

    res.status(200).json({
      status: 'success',
      data: { users: usersWithStatus }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取好友关系状态
 */
exports.getFriendStatus = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user._id;

    const friendship = await Friendship.findOne({
      $or: [
        { fromUser: currentUserId, toUser: targetUserId },
        { fromUser: targetUserId, toUser: currentUserId }
      ]
    });

    let status = 'none';
    if (friendship) {
      if (friendship.status === 'accepted') {
        status = 'accepted';
      } else if (friendship.status === 'pending') {
        status = friendship.fromUser.toString() === currentUserId.toString()
          ? 'pending_sent'
          : 'pending_received';
      }
    }

    res.status(200).json({
      status: 'success',
      data: { status }
    });
  } catch (error) {
    next(error);
  }
};
