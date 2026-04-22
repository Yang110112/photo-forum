import api from './axios';

export const getFavorites = (params) => api.get('/favorites', { params });
export const addFavorite = (postId) => api.post('/favorites', { post: postId });
export const removeFavorite = (postId) => api.delete(`/favorites/${postId}`);
