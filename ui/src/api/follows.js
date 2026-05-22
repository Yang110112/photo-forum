import api from './axios';

// 关注用户
export const followUser = (userId) => api.post(`/follows/${userId}`);

// 取消关注
export const unfollowUser = (userId) => api.delete(`/follows/${userId}`);

// 获取关注列表
export const getFollowing = (userId) => api.get('/follows/following', { params: userId ? { userId } : {} });

// 获取粉丝列表
export const getFollowers = (userId) => api.get('/follows/followers', { params: userId ? { userId } : {} });

// 获取关注/粉丝统计
export const getFollowStats = (userId) => api.get(`/follows/user/${userId}/stats`);
