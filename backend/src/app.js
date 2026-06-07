/**
 * 应用入口 - Express Application
 * 论坛后端API服务
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const jwt = require('jsonwebtoken');

const PrivateMessage = require('./models/PrivateMessage');
const Friendship = require('./models/Friendship');
const User = require('./models/User');

// 导入配置
const { connectDB } = require('./config/database');
require('dotenv').config();

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const categoryRoutes = require('./routes/categories');
const favoriteRoutes = require('./routes/favorites');
const certificationRouter = require('./routes/certification');
const bookingRouter = require('./routes/bookings');
const friendRoutes = require('./routes/friends');
const followRoutes = require('./routes/follows');
const messageRoutes = require('./routes/messages');

// 导入中间件
const { errorHandler } = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// 创建Express应用
const app = express();

// 安全中间件
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(hpp());


// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件
app.use('/uploads', express.static('uploads'));

// API路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/certification', certificationRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/friends', friendRoutes);
app.use('/api/v1/follows', followRoutes);
app.use('/api/v1/messages', messageRoutes);

// 健康检查
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Forum API is running',
    timestamp: new Date().toISOString()
  });
});

// 错误处理
app.use(notFound);
app.use(errorHandler);

// ========== WebSocket: Socket.io 初始化 ==========
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// 在线用户映射: userId -> socket.id
const onlineUsers = new Map();
// socket.id -> userId
const socketUsers = new Map();

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log(`[WS] 用户连接: ${socket.id}`);

  // ----- 认证: 客户端连接后发送 token ----- 
  socket.on('auth', async (data) => {
    try {
      const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('id username avatar isSystem');
      if (!user) {
        socket.emit('auth-error', { message: '用户不存在' });
        return;
      }
      onlineUsers.set(user._id.toString(), socket.id);
      socketUsers.set(socket.id, user._id.toString());
      socket.emit('auth-success', { user });
      console.log(`[WS] 用户认证成功: ${user.username} (${user._id})`);

      // ★ 广播上线状态给所有已连接的好友 ★
      const friends = await Friendship.getFriendList(user._id.toString());
      const friendIds = friends.map(f => f._id.toString());
      for (const friendId of friendIds) {
        const friendSocketId = onlineUsers.get(friendId);
        if (friendSocketId) {
          io.to(friendSocketId).emit('user-online', { userId: user._id.toString(), username: user.username });
        }
      }

      // ★ 返回当前在线好友列表给新连接用户 ★
      const onlineFriendIds = friendIds.filter(fid => onlineUsers.has(fid));
      socket.emit('online-users', { userIds: onlineFriendIds });
    } catch (err) {
      socket.emit('auth-error', { message: 'Token无效或已过期' });
    }
  });

  // ----- 通过 WebSocket 发送私信 -----
  socket.on('send-message', async (data) => {
    const senderId = socketUsers.get(socket.id);
    if (!senderId) {
      socket.emit('error', { message: '请先登录' });
      return;
    }

    const { receiverId, content } = data;
    if (!receiverId || !content || !content.trim()) {
      socket.emit('error', { message: '消息内容不能为空' });
      return;
    }

    try {
      // 检查好友关系
      const areFriends = await Friendship.areFriends(senderId, receiverId);
      if (!areFriends) {
        socket.emit('error', { message: '只能给好友发送私信' });
        return;
      }

      // 保存到数据库
      const conversationId = PrivateMessage.generateConversationId(senderId, receiverId);
      const message = await PrivateMessage.create({
        conversationId,
        sender: senderId,
        receiver: receiverId,
        content: content.trim()
      });
      await message.populate('sender', 'username avatar');

      const formatted = {
        _id: message._id,
        conversationId: message.conversationId,
        content: message.content,
        isRead: false,
        createdAt: message.createdAt,
        sender: message.sender,
        receiverId
      };

      // 通知发送方（发送确认）
      socket.emit('message-sent', formatted);

      // 如果接收方在线，实时推送
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new-message', formatted);
        // 接收方在线则自动标记已读
        await PrivateMessage.updateOne({ _id: message._id }, { isRead: true });
        socket.emit('message-read', { messageId: message._id });
      }

      // 推送会话列表更新给双方
      const convUpdateSender = { conversationId, friendId: receiverId, lastMessage: content.trim(), lastTime: message.createdAt };
      socket.emit('conversation-update', convUpdateSender);

      if (receiverSocketId) {
        const convUpdateReceiver = { conversationId, friendId: senderId, lastMessage: content.trim(), lastTime: message.createdAt, unreadCount: 1 };
        io.to(receiverSocketId).emit('conversation-update', convUpdateReceiver);
      }

      console.log(`[WS] 消息: ${senderId} -> ${receiverId}`);
    } catch (err) {
      console.error('[WS] 发送消息失败:', err);
      socket.emit('error', { message: '发送消息失败' });
    }
  });

  // ----- 输入中提示 -----
  socket.on('typing', (data) => {
    const senderId = socketUsers.get(socket.id);
    if (!senderId) return;
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', { senderId });
    }
  });

  socket.on('stop-typing', (data) => {
    const senderId = socketUsers.get(socket.id);
    if (!senderId) return;
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-stop-typing', { senderId });
    }
  });

  // ----- 查询在线用户 -----
  socket.on('get-online-users', async (data) => {
    const myId = socketUsers.get(socket.id);
    if (!myId) return;
    try {
      const friends = await Friendship.getFriendList(myId);
      const friendIds = friends.map(f => f._id.toString());
      const onlineFriendIds = friendIds.filter(fid => onlineUsers.has(fid));
      socket.emit('online-users', { userIds: onlineFriendIds });
    } catch (err) {
      console.error('[WS] 获取在线用户失败:', err);
    }
  });

  // ----- WebSocket 已读回执 -----
  socket.on('message-read', async (data) => {
    const myId = socketUsers.get(socket.id);
    if (!myId) return;
    try {
      const { conversationId } = data;
      await PrivateMessage.updateMany(
        { conversationId, sender: { $ne: myId }, receiver: myId, isRead: false },
        { isRead: true }
      );
      // 通知发送方消息已读
      const userIds = conversationId.split('_');
      const otherId = userIds[0] === myId ? userIds[1] : userIds[0];
      const otherSocketId = onlineUsers.get(otherId);
      if (otherSocketId) {
        io.to(otherSocketId).emit('message-read', { conversationId, readBy: myId });
      }
    } catch (err) {
      console.error('[WS] 标记已读失败:', err);
    }
  });

  // ----- 断开连接 -----
  socket.on('disconnect', async () => {
    const userId = socketUsers.get(socket.id);
    if (userId) {
      onlineUsers.delete(userId);
      socketUsers.delete(socket.id);
      console.log(`[WS] 用户断开: ${userId}`);

      // ★ 广播离线状态给所有已连接的好友 ★
      try {
        const friends = await Friendship.getFriendList(userId);
        const friendIds = friends.map(f => f._id.toString());
        for (const friendId of friendIds) {
          const friendSocketId = onlineUsers.get(friendId);
          if (friendSocketId) {
            io.to(friendSocketId).emit('user-offline', { userId });
          }
        }
      } catch (err) {
        console.error('[WS] 广播离线状态失败:', err);
      }
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 连接数据库
    await connectDB();

    // 用 http.createServer 同时支持 Express + Socket.io
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/health`);
      console.log(`🔌 WebSocket (Socket.io) 已启用`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', err);
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

module.exports = app;
