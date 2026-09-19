const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const VideoLike = require('../models/VideoLike');
const Subscription = require('../models/Subscription');
const Playlist = require('../models/Playlist');
const WatchHistory = require('../models/WatchHistory');
const WatchLater = require('../models/WatchLater');
const Notification = require('../models/Notification');
const WatchProgress = require('../models/WatchProgress');
const Report = require('../models/Report');

// Sample MP4 videos that are guaranteed to stream smoothly in HTML5 players
const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
];

const SEED_USERS = [
  {
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
    description: 'Viora Platform Administrator & Security Oversight.',
  },
  {
    username: 'demo_creator',
    email: 'demo@example.com',
    role: 'creator',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
    description: 'Welcome to the official Viora Demo Channel! Sharing cutting-edge software engineering tutorials, system design breakdowns, and tech insights.',
  },
  {
    username: 'tech_insights',
    email: 'tech@example.com',
    role: 'creator',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200',
    description: 'Deep dives into modern full-stack development, cloud architectures, DevOps, and performance optimizations.',
  },
  {
    username: 'beat_laboratory',
    email: 'music@example.com',
    role: 'creator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    banner: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200',
    description: 'High energy electronic music production, synth sound design, mixing & mastering walkthroughs.',
  },
  {
    username: 'pixel_warrior',
    email: 'gaming@example.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
    description: 'Pro gaming walkthroughs, speedruns, competitive FPS strategy, and hardware benchmarks.',
  },
];

const SEED_VIDEOS = [
  {
    title: 'Building a Production Ready Video Streaming Platform with MERN Stack',
    description: 'In this full-length deep dive masterclass, we construct a scalable video platform ("Viora") completely from scratch using MongoDB, Express, React 18, and Node.js. Features include JWT authentication, video streaming, nested comments, and channel analytics.',
    category: 'Tech',
    tags: ['mern', 'react', 'nodejs', 'mongodb', 'fullstack'],
    duration: 596,
    views: 12450,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    chapters: [
      { title: 'Introduction & Project Overview', startSeconds: 0 },
      { title: 'Monorepo Architecture & Setup', startSeconds: 90 },
      { title: 'Media Storage & Processing Abstraction', startSeconds: 240 },
      { title: 'Interactive Video Player & Chapters', startSeconds: 380 },
      { title: 'Deployment & Wrap Up', startSeconds: 510 },
    ],
    subtitles: [
      {
        language: 'en',
        label: 'English',
        url: 'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-1080p-30fps/master/subtitles.vtt',
        format: 'vtt',
      },
    ],
  },
  {
    title: 'Next-Gen JavaScript: 10 Modern Features You Should Be Using Today',
    description: 'Explore the newest additions to ECMAScript! Learn how to use pattern matching proposals, decorators, Set composition methods, and array grouping to write clean, maintainable JS code.',
    category: 'Tech',
    tags: ['javascript', 'esnext', 'webdev', 'frontend'],
    duration: 720,
    views: 8940,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    chapters: [
      { title: 'New ES Proposals Overview', startSeconds: 0 },
      { title: 'Array Grouping by Key', startSeconds: 150 },
      { title: 'Set Composition Methods', startSeconds: 340 },
      { title: 'Stage 3 Decorators', startSeconds: 520 },
    ],
  },
  {
    title: 'Lo-Fi Chill Beats to Code and Relax To [24/7 Session]',
    description: 'Smooth, nostalgic lo-fi hip hop instrumental study session. Designed to enhance focus, coding productivity, and late night creative workflow.',
    category: 'Music',
    tags: ['lofi', 'chill', 'beats', 'codingmusic', 'relax'],
    duration: 840,
    views: 45210,
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    chapters: [
      { title: 'Morning Coffee Lo-Fi', startSeconds: 0 },
      { title: 'Deep Focus Coding Groove', startSeconds: 260 },
      { title: 'Night Coding Flow', startSeconds: 560 },
    ],
  },
  {
    title: 'Unreal Engine 5.4 Hyper-Realistic Graphics Showcase',
    description: 'Testing the limits of Nanite, Lumen, and Substrate shaders in the latest Unreal Engine update. Real-time cinematic lighting demo on modern GPU hardware.',
    category: 'Gaming',
    tags: ['unrealengine', 'gaming', 'graphics', 'pcgaming'],
    duration: 410,
    views: 29800,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
  },
  {
    title: 'Docker & Kubernetes Mastery for Full-Stack Developers',
    description: 'Everything you need to package, containerize, orchestrate, and deploy high-availability distributed web applications to Kubernetes clusters with zero downtime.',
    category: 'Education',
    tags: ['docker', 'kubernetes', 'devops', 'cloud'],
    duration: 980,
    views: 15300,
    thumbnailUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800',
    chapters: [
      { title: 'Docker Multi-stage Builds', startSeconds: 0 },
      { title: 'Container Security & Rootless', startSeconds: 320 },
      { title: 'Kubernetes Ingress & TLS', startSeconds: 610 },
      { title: 'Zero Downtime Rolling Deployments', startSeconds: 820 },
    ],
  },
  {
    title: 'Synthwave & Cyberpunk Synth Bass Sound Design Masterclass',
    description: 'Create crushing vintage 80s analog basslines using modern wavetable synthesizers. Featuring FM synthesis, saturation layering, and stereo imaging tips.',
    category: 'Music',
    tags: ['synthwave', 'sounddesign', 'musicproduction', 'audio'],
    duration: 630,
    views: 7420,
    thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
  },
  {
    title: 'Top 10 Competitive Gaming Tips to Rank Up Fast',
    description: 'Master positioning, crosshair placement, economy management, and mental resilience to climb competitive leaderboards effortlessly.',
    category: 'Gaming',
    tags: ['gaming', 'esports', 'tips', 'guide'],
    duration: 520,
    views: 18900,
    thumbnailUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
  },
  {
    title: 'Microservices vs Monolith: Architectural Truths in 2026',
    description: 'When should you actually split your monolith into microservices? We look at real world latency trade-offs, network overhead, database partitioning, and team topology.',
    category: 'Tech',
    tags: ['architecture', 'microservices', 'systemdesign', 'backend'],
    duration: 760,
    views: 21400,
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
  },
  {
    title: 'Ambient Soundscapes for Deep Work and Programming',
    description: 'Continuous atmospheric synthesizers and gentle natural field recordings to keep you in flow state for hours on end.',
    category: 'Music',
    tags: ['ambient', 'deepwork', 'flowstate', 'focus'],
    duration: 900,
    views: 11200,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
  },
  {
    title: 'Understanding Database Indexing & B-Trees Under the Hood',
    description: 'Visual demonstration of how B-Trees, B+Trees, compound indexes, and hash lookups work inside MongoDB and PostgreSQL. Optimize slow queries by 100x.',
    category: 'Education',
    tags: ['database', 'mongodb', 'indexing', 'algorithms'],
    duration: 640,
    views: 13800,
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
  },
  {
    title: 'Retro Gaming Console History & Hardware Architecture',
    description: 'A nostalgic retrospective into how classic 16-bit and 32-bit consoles squeezed impossible visual effects out of limited clock cycles and RAM.',
    category: 'Gaming',
    tags: ['retrogaming', 'console', 'hardware', 'history'],
    duration: 810,
    views: 16750,
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
  },
  {
    title: 'React 19 & Server Components in Action',
    description: 'Exploring Actions, useOptimistic, useActionState, and async Server Components. What every modern frontend engineer needs to understand.',
    category: 'Tech',
    tags: ['react', 'react19', 'frontend', 'javascript'],
    duration: 540,
    views: 19800,
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/viora';
    console.log(`[Seed] Connecting to database: ${mongoUri.replace(/:[^:@]+@/, ':****@')}`);
    
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed] Connected successfully.');

    console.log('[Seed] Clearing existing data collections...');
    await Promise.all([
      User.deleteMany({}),
      Video.deleteMany({}),
      Comment.deleteMany({}),
      VideoLike.deleteMany({}),
      Subscription.deleteMany({}),
      Playlist.deleteMany({}),
      WatchHistory.deleteMany({}),
      WatchLater.deleteMany({}),
      Notification.deleteMany({}),
      WatchProgress.deleteMany({}),
      Report.deleteMany({}),
    ]);
    console.log('[Seed] Database cleaned.');

    console.log('[Seed] Creating demo users...');
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'AdminPassword123!';
    const demoPassword = process.env.DEMO_SEED_PASSWORD || 'DemoPassword123!';

    const createdUsers = await Promise.all(
      SEED_USERS.map((u) =>
        User.create({
          ...u,
          password: u.role === 'admin' ? adminPassword : demoPassword,
        })
      )
    );
    console.log(`[Seed] Created ${createdUsers.length} users.`);

    const adminUser = createdUsers[0];
    const demoUser = createdUsers[1];
    const techUser = createdUsers[2];
    const musicUser = createdUsers[3];
    const gamingUser = createdUsers[4];

    console.log('[Seed] Seeding subscriptions...');
    await Promise.all([
      Subscription.create({ subscriber: demoUser._id, channel: techUser._id }),
      Subscription.create({ subscriber: demoUser._id, channel: musicUser._id }),
      Subscription.create({ subscriber: techUser._id, channel: demoUser._id }),
      Subscription.create({ subscriber: musicUser._id, channel: demoUser._id }),
      Subscription.create({ subscriber: gamingUser._id, channel: demoUser._id }),
    ]);

    await User.findByIdAndUpdate(demoUser._id, { subscribersCount: 3, subscribedToCount: 2 });
    await User.findByIdAndUpdate(techUser._id, { subscribersCount: 1, subscribedToCount: 1 });
    await User.findByIdAndUpdate(musicUser._id, { subscribersCount: 1, subscribedToCount: 1 });
    await User.findByIdAndUpdate(gamingUser._id, { subscribersCount: 0, subscribedToCount: 1 });

    console.log('[Seed] Seeding videos...');
    const createdVideos = [];

    for (let i = 0; i < SEED_VIDEOS.length; i++) {
      const vidData = SEED_VIDEOS[i];
      let owner = demoUser._id;
      if (vidData.category === 'Music') owner = musicUser._id;
      else if (vidData.category === 'Gaming') owner = gamingUser._id;
      else if (i % 2 === 1) owner = techUser._id;

      const video = await Video.create({
        ...vidData,
        owner,
        videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
        visibility: 'public',
        processingStatus: 'ready',
        likesCount: Math.floor(vidData.views * 0.05),
        dislikesCount: Math.floor(vidData.views * 0.002),
        commentsCount: 3,
      });

      createdVideos.push(video);
    }
    console.log(`[Seed] Created ${createdVideos.length} videos.`);

    console.log('[Seed] Seeding likes & comments...');
    for (const video of createdVideos) {
      if (createdVideos.indexOf(video) < 4) {
        await VideoLike.create({
          user: demoUser._id,
          video: video._id,
          type: 'like',
        });
      }

      const comment1 = await Comment.create({
        video: video._id,
        user: demoUser._id,
        text: 'Phenomenal tutorial and breakdown! The explanation on architecture was spot on.',
        likesCount: 5,
      });

      const comment2 = await Comment.create({
        video: video._id,
        user: techUser._id,
        text: 'Really high quality production value. Subscribed and looking forward to the next upload!',
        likesCount: 3,
      });

      await Comment.create({
        video: video._id,
        user: musicUser._id,
        parentComment: comment1._id,
        text: 'Completely agree! Especially the part around modular service design.',
        likesCount: 1,
      });
    }

    console.log('[Seed] Seeding watch history, watch later & watch progress...');
    for (let i = 0; i < 5; i++) {
      await WatchHistory.create({
        user: demoUser._id,
        video: createdVideos[i]._id,
        watchedAt: new Date(Date.now() - i * 3600 * 1000 * 6),
      });
    }

    await WatchLater.create({ user: demoUser._id, video: createdVideos[5]._id });
    await WatchLater.create({ user: demoUser._id, video: createdVideos[6]._id });

    // Seed Continue Watching records for demoUser
    await Promise.all([
      WatchProgress.create({
        user: demoUser._id,
        video: createdVideos[0]._id,
        currentPosition: 145,
        duration: createdVideos[0].duration,
        percentWatched: 24,
        completed: false,
        lastWatchedAt: new Date(Date.now() - 1000 * 60 * 30),
      }),
      WatchProgress.create({
        user: demoUser._id,
        video: createdVideos[1]._id,
        currentPosition: 360,
        duration: createdVideos[1].duration,
        percentWatched: 50,
        completed: false,
        lastWatchedAt: new Date(Date.now() - 1000 * 60 * 120),
      }),
      WatchProgress.create({
        user: demoUser._id,
        video: createdVideos[4]._id,
        currentPosition: 490,
        duration: createdVideos[4].duration,
        percentWatched: 50,
        completed: false,
        lastWatchedAt: new Date(Date.now() - 1000 * 60 * 240),
      }),
    ]);

    console.log('[Seed] Seeding custom playlists...');
    await Playlist.create({
      name: 'Full-Stack Development Mastery',
      description: 'Handpicked series of top engineering tutorials and masterclasses.',
      owner: demoUser._id,
      visibility: 'public',
      videos: [createdVideos[0]._id, createdVideos[1]._id, createdVideos[4]._id, createdVideos[7]._id],
    });

    await Playlist.create({
      name: 'Chill Coding Beats',
      description: 'Soundtracks for late night focus.',
      owner: demoUser._id,
      visibility: 'public',
      videos: [createdVideos[2]._id, createdVideos[5]._id, createdVideos[8]._id],
    });

    console.log('[Seed] Seeding notifications...');
    await Notification.create({
      recipient: demoUser._id,
      sender: techUser._id,
      type: 'subscribe',
      text: 'tech_insights subscribed to your channel',
      read: false,
    });

    await Notification.create({
      recipient: demoUser._id,
      sender: musicUser._id,
      type: 'like',
      video: createdVideos[0]._id,
      text: 'liked your video "Building a Production Ready YouTube Clone"',
      read: false,
    });

    await Notification.create({
      recipient: demoUser._id,
      sender: gamingUser._id,
      type: 'comment',
      video: createdVideos[0]._id,
      text: 'commented on your video',
      read: true,
    });

    console.log('[Seed] Seeding moderation reports...');
    await Report.create({
      reportedBy: demoUser._id,
      targetType: 'video',
      targetId: createdVideos[3]._id,
      reason: 'misinformation',
      description: 'The shader benchmark specifications quoted in the title seem inaccurate.',
      status: 'pending',
    });

    await Report.create({
      reportedBy: techUser._id,
      targetType: 'video',
      targetId: createdVideos[6]._id,
      reason: 'spam',
      description: 'Duplicate promotional link in description.',
      status: 'resolved',
      reviewedBy: adminUser._id,
      resolutionNotes: 'Reviewed description; links conform to platform policy.',
      resolvedAt: new Date(),
    });

    console.log('\n=============================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY! ');
    console.log('=============================================');
    console.log('Admin Credentials:');
    console.log('  Email:    admin@example.com');
    console.log('  Password: AdminPassword123!');
    console.log('  Role:     admin\n');
    console.log('Demo Creator Credentials:');
    console.log('  Email:    demo@example.com');
    console.log('  Password: DemoPassword123!');
    console.log('  Role:     creator\n');
    console.log('Other channels:');
    console.log('  tech@example.com   (tech_insights, creator)');
    console.log('  music@example.com  (beat_laboratory, creator)');
    console.log('  gaming@example.com (pixel_warrior, user)\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error during database seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
