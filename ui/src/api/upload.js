import api from './axios';

// 上传文件（证书、作品等）
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};