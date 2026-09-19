import api from './api';

export const toggleVideoLikeApi = async (videoId, type) => {
  return await api.post(`/videos/${videoId}/like`, { type });
};

export const getVideoInteractionStatusApi = async (videoId) => {
  return await api.get(`/videos/${videoId}/interaction`);
};
