import api from './api';

export const registerUserApi = async (userData) => {
  return await api.post('/auth/register', userData);
};

export const loginUserApi = async (credentials) => {
  return await api.post('/auth/login', credentials);
};

export const logoutUserApi = async () => {
  return await api.post('/auth/logout');
};

export const getCurrentUserApi = async () => {
  return await api.get('/auth/me');
};

export const changePasswordApi = async (passwordData) => {
  return await api.put('/auth/change-password', passwordData);
};

export const updateProfileApi = async (profileData) => {
  return await api.put('/auth/profile', profileData);
};

export const deleteAccountApi = async () => {
  return await api.delete('/auth/account');
};
