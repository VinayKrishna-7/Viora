import api from './api';

export const getNotificationsApi = async (params = {}) => {
  return await api.get('/notifications', { params });
};

export const getUnreadCountApi = async () => {
  return await api.get('/notifications/unread-count');
};

export const markAsReadApi = async (id) => {
  return await api.patch(`/notifications/${id}/read`);
};

export const markAllAsReadApi = async () => {
  return await api.patch('/notifications/read-all');
};
