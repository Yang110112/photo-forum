// ui/src/api/certification.js — 新建文件

import api from './axios';

export const submitCertification = (data) => api.post('/certification', data);
export const getMyCertification = () => api.get('/certification/my');
export const getAllCerts = () => api.get('/certification');
export const reviewCert = (data) => api.post('/certification/review', data);