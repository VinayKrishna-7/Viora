import api from './api';

/**
 * Get single YouTube video details via backend proxy
 */
export const getYouTubeVideoDetailsApi = async (videoId) => {
  const cleanId = (videoId || '').replace(/^yt_/, '');
  const response = await api.get(`/search/youtube/${cleanId}`);
  return response.data;
};

/**
 * Get related YouTube videos via backend proxy
 */
export const getRelatedYouTubeVideosApi = async (videoId, limit = 10) => {
  const cleanId = (videoId || '').replace(/^yt_/, '');
  const response = await api.get(`/search/youtube/${cleanId}/related`, {
    params: { limit },
  });
  return response.data;
};
