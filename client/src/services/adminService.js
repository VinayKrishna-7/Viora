import api from './api';

export const getPlatformStatsApi = async () => {
  return await api.get('/admin/stats');
};

export const listUsersApi = async (params = {}) => {
  return await api.get('/admin/users', { params });
};

export const changeUserRoleApi = async (userId, role) => {
  return await api.patch(`/admin/users/${userId}/role`, { role });
};

export const toggleUserSuspensionApi = async (userId, isSuspended) => {
  return await api.patch(`/admin/users/${userId}/suspension`, { isSuspended });
};

export const listAllVideosApi = async (params = {}) => {
  return await api.get('/admin/videos', { params });
};

export const setVideoVisibilityApi = async (videoId, visibility) => {
  return await api.patch(`/admin/videos/${videoId}/visibility`, { visibility });
};

export const deleteVideoAsAdminApi = async (videoId) => {
  return await api.delete(`/admin/videos/${videoId}`);
};

export const getReportsApi = async (params = {}) => {
  return await api.get('/admin/reports', { params });
};

export const updateReportStatusApi = async (reportId, status, resolutionNotes) => {
  return await api.patch(`/admin/reports/${reportId}`, { status, resolutionNotes });
};
