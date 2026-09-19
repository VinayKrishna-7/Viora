import api from './api';

export const createReportApi = async ({ targetType, targetId, reason, description }) => {
  return await api.post('/reports', { targetType, targetId, reason, description });
};
