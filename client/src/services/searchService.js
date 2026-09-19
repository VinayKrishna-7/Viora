import api from './api';

export const searchVideosApi = async (params = {}) => {
  return await api.get('/search', { params });
};
