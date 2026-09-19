import api from './api';

export const saveProgressApi = async (videoId, currentPosition, duration) => {
  return await api.post(`/progress/${videoId}`, { currentPosition, duration });
};

export const getProgressApi = async (videoId) => {
  return await api.get(`/progress/${videoId}`);
};

export const getContinueWatchingApi = async (params = {}) => {
  return await api.get('/progress/continue-watching', { params });
};

export const deleteProgressApi = async (videoId) => {
  return await api.delete(`/progress/${videoId}`);
};
