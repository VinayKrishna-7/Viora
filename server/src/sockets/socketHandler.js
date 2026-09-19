const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let ioInstance = null;

const initSocket = (httpServer) => {
  const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:')) {
          callback(null, true);
        } else {
          callback(new Error('CORS rejected socket origin'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Socket Auth Middleware
  ioInstance.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      let token = null;

      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, str) => {
          const [key, val] = str.trim().split('=');
          if (key && val) acc[key] = decodeURIComponent(val);
          return acc;
        }, {});
        token = cookies.token;
      }

      if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
      }

      if (token) {
        const secret = process.env.JWT_SECRET || 'viora_development_super_secret_key_2026_secure';
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id).select('username role isSuspended');
        if (user && !user.isSuspended) {
          socket.user = user;
        }
      }
      next();
    } catch (err) {
      // Allow connection even if unauthenticated, but user won't join private room
      next();
    }
  });

  ioInstance.on('connection', (socket) => {
    if (socket.user) {
      const room = `user_${socket.user._id.toString()}`;
      socket.join(room);
    }

    socket.on('disconnect', () => {
      // Disconnected cleanly
    });
  });

  return ioInstance;
};

const getIO = () => ioInstance;

const sendNotificationToUser = (userId, notificationData) => {
  if (!ioInstance) return;
  const room = `user_${userId.toString()}`;
  ioInstance.to(room).emit('notification', notificationData);
};

module.exports = {
  initSocket,
  getIO,
  sendNotificationToUser,
};
