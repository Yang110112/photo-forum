/**
 * 私信模型 - PrivateMessage Model
 * 管理好友之间的私聊消息
 */

const mongoose = require('mongoose');

const privateMessageSchema = new mongoose.Schema({
  // 会话ID（两个用户ID排序后拼接，保证唯一）
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  // 发送者
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // 接收者
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // 消息内容
  content: {
    type: String,
    required: [true, '消息内容不能为空'],
    trim: true,
    maxlength: [2000, '消息最多2000个字符']
  },
  // 是否已读
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 索引：按会话和时间排序
privateMessageSchema.index({ conversationId: 1, createdAt: 1 });

// 静态方法：生成会话ID
privateMessageSchema.statics.generateConversationId = function(userId1, userId2) {
  const sorted = [userId1.toString(), userId2.toString()].sort();
  return `${sorted[0]}_${sorted[1]}`;
};

const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema);

module.exports = PrivateMessage;
