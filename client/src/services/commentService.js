import api from './api';

export const getVideoCommentsApi = async (videoId, params = {}) => {
  return await api.get(`/videos/${videoId}/comments`, { params });
};

export const addCommentApi = async (videoId, { text, parentCommentId }) => {
  return await api.post(`/videos/${videoId}/comments`, { text, parentCommentId });
};

export const getCommentRepliesApi = async (commentId, params = {}) => {
  return await api.get(`/comments/${commentId}/replies`, { params });
};

export const updateCommentApi = async (commentId, { text }) => {
  return await api.put(`/comments/${commentId}`, { text });
};

export const deleteCommentApi = async (commentId) => {
  return await api.delete(`/comments/${commentId}`);
};
