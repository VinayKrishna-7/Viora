import api from './api';

export const getHistoryApi = async (params = {}) => {
  return await api.get('/history', { params });
};

export const addToHistoryApi = async (videoId) => {
  return await api.post(`/history/${videoId}`);
};

export const removeFromHistoryApi = async (videoId) => {
  return await api.delete(`/history/${videoId}`);
};

export const clearHistoryApi = async () => {
  return await api.delete('/history');
};

// Aliases for compatibility
export const getWatchHistoryApi = getHistoryApi;
export const clearWatchHistoryApi = clearHistoryApi;
