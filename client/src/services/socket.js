import { io } from 'socket.io-client';

let socket = null;

export const initSocketClient = () => {
  if (socket) return socket;

  const serverUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  socket = io(serverUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocketClient();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
