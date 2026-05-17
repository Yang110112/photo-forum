import api from './axios';

// 发送私信
export const sendMessage = (data) => api.post('/messages', data);

// 获取会话消息
export const getConversation = (friendId, params) => api.get(`/messages/${friendId}`, { params });

// 获取会话列表
export const getConversations = () => api.get('/messages/conversations');

// 获取未读消息数
export const getUnreadCount = () => api.get('/messages/unread');
