import api from './api';

export const getWatchLaterApi = async (params = {}) => {
  return await api.get('/watch-later', { params });
};

export const toggleWatchLaterApi = async (videoId) => {
  return await api.post(`/watch-later/${videoId}`);
};

export const getWatchLaterStatusApi = async (videoId) => {
  return await api.get(`/watch-later/${videoId}/status`);
};
