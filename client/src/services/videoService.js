import api from './api';

export const uploadVideoApi = async (formData, onUploadProgress) => {
  return await api.post('/videos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      }
    },
  });
};

export const getVideosApi = async (params = {}) => {
  return await api.get('/videos', { params });
};

export const getVideoByIdApi = async (id) => {
  return await api.get(`/videos/${id}`);
};

export const incrementViewsApi = async (id) => {
  return await api.patch(`/videos/${id}/view`);
};

export const getChannelVideosApi = async (username, params = {}) => {
  return await api.get(`/videos/channel/${username}`, { params });
};

export const updateVideoApi = async (id, formData) => {
  return await api.put(`/videos/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteVideoApi = async (id) => {
  return await api.delete(`/videos/${id}`);
};

export const getRecommendationsApi = async (id, params = {}) => {
  return await api.get(`/videos/${id}/recommendations`, { params });
};

export const getLikedVideosApi = async (params = {}) => {
  return await api.get('/videos/liked', { params });
};

