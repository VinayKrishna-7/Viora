import api from './api';

export const getChannelProfileApi = async (username) => {
  return await api.get(`/users/${username}`);
};
