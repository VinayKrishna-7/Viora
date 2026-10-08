# Viora

A video sharing and streaming platform that allows users to upload content, discover videos, create playlists, and interact through comments and channel subscriptions.

## Features

- Video playback with custom controls, chapters, and subtitles
- Video search across local uploads and YouTube
- Creator studio for uploading videos and viewing channel analytics
- User playlists, watch history, and watch later
- Comments, likes, and real-time notifications
- JWT authentication with role-based access (User, Creator, Admin)

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Redux Toolkit
- **Backend:** Node.js, Express, MongoDB, Socket.io
- **Storage:** Local uploads / Cloudinary

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB running locally

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/VinayKrishna-7/Viora.git
   cd Viora
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Configure environment variables:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. Seed sample data (optional):
   ```bash
   npm run seed
   ```

5. Start the development servers:
   ```bash
   npm run dev
   ```

The app will run at `http://localhost:5173` with the backend at `http://localhost:5000`.

## License

ISC
