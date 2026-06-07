import api from './axios';

// 发送私信（已废弃 — 主流程已改用 WebSocket 的 send-message 事件，保留为备用）
export const sendMessage = (data) => api.post('/messages', data);

// 获取会话消息
export const getConversation = (friendId, params) => api.get(`/messages/${friendId}`, { params });

// 获取会话列表
export const getConversations = () => api.get('/messages/conversations');

// 获取未读消息数
export const getUnreadCount = () => api.get('/messages/unread');

// 系统官方一键广播通知所有用户
export const broadcastMessage = (data) => api.post('/messages/broadcast', data);

// 获取广播历史记录
export const getBroadcastHistory = (params) => api.get('/messages/broadcast/history', { params });