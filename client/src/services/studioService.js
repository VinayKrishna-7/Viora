import api from './api';

export const getStudioAnalyticsApi = async () => {
  return await api.get('/studio/analytics');
};

export const getStudioContentApi = async (params = {}) => {
  return await api.get('/studio/content', { params });
};

export const getStudioCommentsApi = async (params = {}) => {
  return await api.get('/studio/comments', { params });
};
