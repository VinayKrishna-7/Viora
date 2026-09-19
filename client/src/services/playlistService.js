import api from './api';

export const createPlaylistApi = async (data) => {
  return await api.post('/playlists', data);
};

export const getUserPlaylistsApi = async () => {
  return await api.get('/playlists');
};

export const getPlaylistByIdApi = async (id) => {
  return await api.get(`/playlists/${id}`);
};

export const updatePlaylistApi = async (id, data) => {
  return await api.put(`/playlists/${id}`, data);
};

export const deletePlaylistApi = async (id) => {
  return await api.delete(`/playlists/${id}`);
};

export const addVideoToPlaylistApi = async (playlistId, videoId) => {
  return await api.post(`/playlists/${playlistId}/videos/${videoId}`);
};

export const removeVideoFromPlaylistApi = async (playlistId, videoId) => {
  return await api.delete(`/playlists/${playlistId}/videos/${videoId}`);
};
