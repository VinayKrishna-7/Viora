const http = require('http');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server root or parent
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/db');
const app = require('./app');
const { initSocket } = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

// Start Server after initiating DB connection
const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    // Initialize Socket.IO real-time engine
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`[Server] Viora server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[Server] WebSocket engine initialized.`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful Shutdown Handler
    const shutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(() => {
        console.log('[Server] HTTP and WebSocket server closed.');
        process.exit(0);
      });

      // Force close if taking too long
      setTimeout(() => {
        console.error('[Server] Forceful shutdown initiated.');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error(`[Server] Fatal startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
