import api from './axios';

// 获取帖子列表
export const getPosts = (params) => api.get('/posts', { params });

// 获取帖子详情
export const getPostById = (id) => api.get(`/posts/${id}`);

// 创建帖子
export const createPost = (data) => api.post('/posts', data);

// 删除帖子
export const deletePost = (id) => api.delete(`/posts/${id}`);

// 点赞
export const likePost = (id) => api.post(`/posts/${id}/like`);

// 取消点赞
export const unlikePost = (id) => api.delete(`/posts/${id}/like`);