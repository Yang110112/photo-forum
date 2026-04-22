import api from './axios';

export const getCategories = () => api.get('/categories');
export const getCategoryBySlug = (slug) => api.get(`/categories/${slug}`);
