const mongoose = require('mongoose');
const path = require('path');
const os = require('os');
const fs = require('fs');

let mongodInstance = null;

/**
 * Connect to MongoDB with resilient fallback to local embedded engine
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/viora';

  // Attempt 1: Try connecting to configured MONGO_URI
  try {
    const connectionInstance = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected successfully to ${mongoUri}! Host: ${connectionInstance.connection.host}`);
    await autoSeedIfEmpty();
    return connectionInstance;
  } catch (initialErr) {
    console.warn(`[MongoDB] Initial connection to ${mongoUri} failed: ${initialErr.message}`);
  }

  // Attempt 2: Start embedded MongoDB engine on port 27017 with local persistence
  try {
    console.log('[MongoDB] Starting embedded MongoDB engine with local persistence...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const localDbPath = path.resolve(os.homedir(), 'AppData', 'Local', 'viora_db');
    if (!fs.existsSync(localDbPath)) {
      fs.mkdirSync(localDbPath, { recursive: true });
    }

    mongodInstance = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbPath: localDbPath,
        storageEngine: 'wiredTiger',
        dbName: 'viora',
      },
    });

    const rawUri = mongodInstance.getUri();
    const uri = rawUri.endsWith('/') ? `${rawUri}viora` : `${rawUri}/viora`;
    console.log(`[MongoDB] Embedded engine started at ${uri}`);
    const connectionInstance = await mongoose.connect(uri);
    console.log('[MongoDB] Connected successfully to embedded database!');
    await autoSeedIfEmpty();
    return connectionInstance;
  } catch (err) {
    console.warn('[MongoDB] Standard port 27017 busy, falling back to dynamic port...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: { dbName: 'viora' },
      });
      const rawUri = mongodInstance.getUri();
      const uri = rawUri.endsWith('/') ? `${rawUri}viora` : `${rawUri}/viora`;
      console.log(`[MongoDB] Dynamic embedded engine started at ${uri}`);
      const connectionInstance = await mongoose.connect(uri);
      console.log('[MongoDB] Connected successfully to dynamic embedded database!');
      await autoSeedIfEmpty();
      return connectionInstance;
    } catch (finalErr) {
      console.error('[MongoDB] Fatal database connection error:', finalErr.message);
    }
  }
};

/**
 * Auto-seed database if no users exist
 */
const autoSeedIfEmpty = async () => {
  try {
    // Never auto-seed default credentials in production unless explicitly enabled
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_AUTO_SEED !== 'true') {
      return;
    }

    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[MongoDB] Empty database detected. Running initial auto-seed...');
      const bcrypt = require('bcryptjs');
      const Video = require('../models/Video');
      
      const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'AdminPassword123!';
      const demoPassword = process.env.DEMO_INITIAL_PASSWORD || 'DemoPassword123!';

      // Create Admin
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        password: adminPassword,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        description: 'Viora Platform Administrator & Security Oversight.',
      });

      // Create Demo Creator
      const demoUser = await User.create({
        username: 'demo_creator',
        email: 'demo@example.com',
        role: 'creator',
        password: demoPassword,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
        description: 'Welcome to the official Viora Demo Channel! Sharing cutting-edge software engineering tutorials, system design breakdowns, and tech insights.',
      });

      // Create Sample Video
      await Video.create({
        title: 'Building a Production Ready Video Streaming Platform with MERN Stack',
        description: 'In this full-length deep dive masterclass, we construct a scalable video platform ("Viora") completely from scratch.',
        category: 'Tech',
        tags: ['mern', 'react', 'nodejs', 'mongodb', 'fullstack'],
        duration: 596,
        views: 12450,
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        owner: demoUser._id,
        visibility: 'public',
        processingStatus: 'ready',
        chapters: [
          { title: 'Introduction & Project Overview', startSeconds: 0 },
          { title: 'Monorepo Architecture & Setup', startSeconds: 90 },
          { title: 'Deployment & Wrap Up', startSeconds: 510 },
        ],
      });

      console.log('[MongoDB] Initial auto-seed completed successfully!');
    }
  } catch (err) {
    console.warn('[MongoDB] Auto-seed check notice:', err.message);
  }
};

process.on('SIGINT', async () => {
  if (mongodInstance) {
    await mongodInstance.stop();
  }
  process.exit(0);
});

module.exports = connectDB;
