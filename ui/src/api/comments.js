import api from './axios';

export const getCommentsByPost = (postId, params) => api.get(`/posts/${postId}/comments`, { params });
export const createComment = (data) => api.post('/comments', data);
export const deleteComment = (id) => api.delete(`/comments/${id}`);
