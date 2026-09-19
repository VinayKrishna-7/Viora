import api from './api';

export const toggleSubscriptionApi = async (channelId) => {
  return await api.post(`/subscriptions/${channelId}`);
};

export const getSubscriptionStatusApi = async (channelId) => {
  return await api.get(`/subscriptions/${channelId}/status`);
};

export const getSubscribedFeedApi = async (params = {}) => {
  return await api.get('/subscriptions/feed', { params });
};

export const getSubscribedChannelsApi = async () => {
  return await api.get('/subscriptions/channels');
};
