import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminRoute from '../components/common/AdminRoute';
import HomePage from '../pages/Home/HomePage';
import WatchPage from '../pages/Watch/WatchPage';
import YouTubeWatchPage from '../pages/Watch/YouTubeWatchPage';
import SearchPage from '../pages/Search/SearchPage';
import ChannelPage from '../pages/Channel/ChannelPage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import SettingsPage from '../pages/Settings/SettingsPage';
import SubscriptionsPage from '../pages/Subscriptions/SubscriptionsPage';
import HistoryPage from '../pages/History/HistoryPage';
import LikedVideosPage from '../pages/LikedVideos/LikedVideosPage';
import WatchLaterPage from '../pages/WatchLater/WatchLaterPage';
import PlaylistsPage from '../pages/Playlists/PlaylistsPage';
import PlaylistDetailsPage from '../pages/Playlists/PlaylistDetailsPage';
import ShortsPage from '../pages/Shorts/ShortsPage';
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage';
import StudioLayout from '../layouts/StudioLayout';
import StudioDashboardPage from '../pages/Studio/StudioDashboardPage';
import StudioContentPage from '../pages/Studio/StudioContentPage';
import StudioAnalyticsPage from '../pages/Studio/StudioAnalyticsPage';
import StudioCommentsPage from '../pages/Studio/StudioCommentsPage';
import NotFoundPage from '../pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Standalone Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main Shell Layout Routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shorts" element={<ShortsPage />} />
        <Route path="/watch/:videoId" element={<WatchPage />} />
        <Route path="/watch/youtube/:videoId" element={<YouTubeWatchPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/channel/:username" element={<ChannelPage />} />
        <Route path="/playlist/:playlistId" element={<PlaylistDetailsPage />} />


        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/liked" element={<LikedVideosPage />} />
          <Route path="/watch-later" element={<WatchLaterPage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
        </Route>

        {/* Protected Admin Route */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Protected Creator Studio Routes (Dedicated Studio Layout) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/studio" element={<StudioLayout />}>
          <Route index element={<StudioDashboardPage />} />
          <Route path="content" element={<StudioContentPage />} />
          <Route path="analytics" element={<StudioAnalyticsPage />} />
          <Route path="comments" element={<StudioCommentsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
