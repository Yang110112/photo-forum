import api from './axios';

// 发送好友请求
export const sendFriendRequest = (data) => api.post('/friends/request', data);

// 接受好友请求
export const acceptFriendRequest = (requestId) => api.put(`/friends/request/${requestId}/accept`);

// 拒绝好友请求
export const rejectFriendRequest = (requestId) => api.put(`/friends/request/${requestId}/reject`);

// 获取好友列表
export const getFriends = () => api.get('/friends');

// 获取待处理的好友请求
export const getPendingRequests = () => api.get('/friends/requests');

// 搜索用户
export const searchUsers = (keyword) => api.get('/friends/search', { params: { keyword } });

// 删除好友
export const removeFriend = (friendId) => api.delete(`/friends/${friendId}`);

// 获取与某用户的好友状态
export const getFriendStatus = (userId) => api.get(`/friends/${userId}/status`);
