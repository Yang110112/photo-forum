/**
 * 应用入口 - Express Application
 * 论坛后端API服务
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

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

// 启动服务器
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 连接数据库
    await connectDB();

    // 启动服务
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/health`);
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
