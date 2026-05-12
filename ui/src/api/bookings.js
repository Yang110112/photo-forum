import api from './axios';

// 创建约拍请求
export const createBooking = (data) => api.post('/bookings', data);

// 获取收到的约拍请求（摄影师端）
export const getReceivedBookings = () => api.get('/bookings/received');

// 获取发出的约拍请求（用户端）
export const getSentBookings = () => api.get('/bookings/sent');

// 更新约拍状态（接受/拒绝）
export const updateBookingStatus = (id, data) => api.patch(`/bookings/${id}`, data);