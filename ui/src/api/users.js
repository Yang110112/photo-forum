import api from './axios';

export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.put('/users/me', data);
export const updatePassword = (data) => api.put('/users/me/password', data);
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const getUserById = (id) => api.get(`/users/${id}`);
export const getUserPosts = (id, params) => api.get(`/users/${id}/posts`, { params });
