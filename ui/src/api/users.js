import api from './axios';

export const getUserById = (id) => api.get(`/users/${id}`);
export const updateProfile = (data) => api.put('/users/profile', data);
export const getUserPosts = (id, params) => api.get(`/users/${id}/posts`, { params });
