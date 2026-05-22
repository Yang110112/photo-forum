/**
 * 数据库配置 - MongoDB Connection
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // 连接事件监听
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
};

// 自动创建索引
const initIndexes = async () => {
  try {
    const User = require('../models/User');
    const Post = require('../models/Post');
    const Comment = require('../models/Comment');
    const Category = require('../models/Category');
    const Like = require('../models/Like');
    const Favorite = require('../models/Favorite');
    const Friendship = require('../models/Friendship');
    const Follow = require('../models/Follow');
    const PrivateMessage = require('../models/PrivateMessage');

    await Promise.all([
      User.createIndexes(),
      Post.createIndexes(),
      Comment.createIndexes(),
      Category.createIndexes(),
      Like.createIndexes(),
      Favorite.createIndexes(),
      Friendship.createIndexes(),
      Follow.createIndexes(),
      PrivateMessage.createIndexes()
    ]);

    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = { connectDB, initIndexes };
