import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  Video, 
  Flag, 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Trash2, 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye, 
  RefreshCw 
} from 'lucide-react';
import { 
  getPlatformStatsApi, 
  listUsersApi, 
  changeUserRoleApi, 
  toggleUserSuspensionApi, 
  listAllVideosApi, 
  setVideoVisibilityApi, 
  deleteVideoAsAdminApi, 
  getReportsApi, 
  updateReportStatusApi 
} from '../../services/adminService';
import { formatDateAgo, formatViews } from '../../utils/formatters';
import Button from '../../components/ui/Button';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('stats');

  // Stats state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Videos state
  const [videos, setVideos] = useState([]);
  const [videoSearch, setVideoSearch] = useState('');
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Reports state
  const [reports, setReports] = useState([]);
  const [reportStatusFilter, setReportStatusFilter] = useState('pending');
  const [loadingReports, setLoadingReports] = useState(false);

  // Resolution modal / prompt state
  const [resolutionPrompt, setResolutionPrompt] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // 1. Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await getPlatformStatsApi();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const params = { limit: 50 };
      if (userSearch) params.search = userSearch;
      if (userRoleFilter) params.role = userRoleFilter;
      const res = await listUsersApi(params);
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [userSearch, userRoleFilter]);

  // 3. Fetch Videos
  const fetchVideos = useCallback(async () => {
    try {
      setLoadingVideos(true);
      const params = { limit: 50 };
      if (videoSearch) params.search = videoSearch;
      const res = await listAllVideosApi(params);
      setVideos(res.data?.videos || []);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoadingVideos(false);
    }
  }, [videoSearch]);

  // 4. Fetch Reports
  const fetchReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      const params = { limit: 50 };
      if (reportStatusFilter) params.status = reportStatusFilter;
      const res = await getReportsApi(params);
      setReports(res.data?.reports || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoadingReports(false);
    }
  }, [reportStatusFilter]);

  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'videos') fetchVideos();
    if (activeTab === 'reports') fetchReports();
  }, [activeTab, fetchStats, fetchUsers, fetchVideos, fetchReports]);

  // User Actions
  const handleRoleChange = async (userId, newRole) => {
    try {
      await changeUserRoleApi(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleToggleSuspension = async (userId, currentSuspended) => {
    const nextState = !currentSuspended;
    if (!window.confirm(`Are you sure you want to ${nextState ? 'SUSPEND' : 'REACTIVATE'} this user?`)) return;
    try {
      await toggleUserSuspensionApi(userId, nextState);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isSuspended: nextState } : u))
      );
    } catch (err) {
      alert(err.message || 'Failed to update suspension status');
    }
  };

  // Video Actions
  const handleVisibilityChange = async (videoId, visibility) => {
    try {
      await setVideoVisibilityApi(videoId, visibility);
      setVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, visibility } : v))
      );
    } catch (err) {
      alert(err.message || 'Failed to update visibility');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to permanently delete this video as Admin?')) return;
    try {
      await deleteVideoAsAdminApi(videoId);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err) {
      alert(err.message || 'Failed to delete video');
    }
  };

  // Report Resolution
  const handleResolveReport = async () => {
    if (!resolutionPrompt) return;
    const { reportId, status } = resolutionPrompt;
    try {
      await updateReportStatusApi(reportId, status, resolutionNotes);
      setReports((prev) =>
        prev.map((r) =>
          r._id === reportId ? { ...r, status, resolutionNotes } : r
        )
      );
      setResolutionPrompt(null);
      setResolutionNotes('');
    } catch (err) {
      alert(err.message || 'Failed to update report');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-viora-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1 font-display tracking-tight">
            Admin Console
          </h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-viora-card rounded-2xl border border-viora-border overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'videos'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Videos</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>Reports</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Platform Overview */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {loadingStats ? (
            <div className="py-20 text-center text-slate-400">Loading metrics...</div>
          ) : !stats ? (
            <div className="text-center text-rose-400 py-10">Unable to load statistics.</div>
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-viora-card border border-viora-border rounded-2xl shadow-md">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Accounts</span>
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-100 font-mono">
                    {stats.users?.total || 0}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex gap-2">
                    <span>Creators: {stats.users?.creators || 0}</span>
                    <span>•</span>
                    <span>Admins: {stats.users?.admins || 0}</span>
                  </div>
                </div>

                <div className="p-5 bg-viora-card border border-viora-border rounded-2xl shadow-md">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Original Content</span>
                    <Video className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-100 font-mono">
                    {stats.videos?.total || 0}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex gap-2">
                    <span>Public: {stats.videos?.public || 0}</span>
                    <span>•</span>
                    <span>Private: {stats.videos?.private || 0}</span>
                  </div>
                </div>

                <div className="p-5 bg-viora-card border border-viora-border rounded-2xl shadow-md">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Plays</span>
                    <Eye className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-100 font-mono">
                    {formatViews(stats.videos?.totalViews || 0).replace(' views', '')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Cumulative stream interactions
                  </div>
                </div>

                <div className="p-5 bg-viora-card border border-viora-border rounded-2xl shadow-md">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Pending Flags</span>
                    <Flag className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-100 font-mono">
                    {stats.reports?.pending || 0}
                  </div>
                  <div className="text-[11px] text-amber-400 mt-1 font-medium">
                    Requiring audit ({stats.reports?.resolved || 0} resolved)
                  </div>
                </div>
              </div>

              {/* Additional Metric Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-viora-card border border-viora-border rounded-3xl space-y-3">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Security & Moderation Status
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-viora-surface border border-viora-border/50">
                      <span className="text-slate-400">Suspended Users:</span>
                      <span className="font-bold text-rose-400 font-mono">{stats.users?.suspended || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-viora-surface border border-viora-border/50">
                      <span className="text-slate-400">Total Comments Logged:</span>
                      <span className="font-bold text-slate-200 font-mono">{stats.comments?.total || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-viora-surface border border-viora-border/50">
                      <span className="text-slate-400">All-time Reports:</span>
                      <span className="font-bold text-slate-200 font-mono">{stats.reports?.total || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-viora-card border border-viora-border rounded-3xl space-y-3">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Platform Infrastructure
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-viora-surface border border-viora-border/50">
                      <span className="text-slate-400">Media Pipeline:</span>
                      <span className="font-semibold text-emerald-400 uppercase font-mono">{stats.system?.mediaProvider || 'Local Storage'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-viora-surface border border-viora-border/50">
                      <span className="text-slate-400">Realtime Engine:</span>
                      <span className="font-semibold text-indigo-400 font-mono">WebSocket / Socket.IO</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-viora-surface border border-viora-border/50">
                      <span className="text-slate-400">Auth & Permissions:</span>
                      <span className="font-semibold text-violet-400 font-mono">RBAC System</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-viora-card p-3 rounded-2xl border border-viora-border">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search username or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-viora-surface rounded-xl text-xs border border-viora-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 bg-viora-surface rounded-xl text-xs border border-viora-border text-slate-200 focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="creator">Creator</option>
                <option value="admin">Admin</option>
              </select>

              <button
                onClick={fetchUsers}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-viora-card rounded-3xl border border-viora-border overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-viora-surface text-slate-400 uppercase tracking-wider font-semibold border-b border-viora-border text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Joined</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-viora-border/60">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">Loading users...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">No users match criteria.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                              alt={u.username}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                            />
                            <div>
                              <p className="font-semibold text-slate-200">@{u.username}</p>
                              <p className="text-[11px] text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={u.role || 'user'}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="bg-viora-surface text-slate-200 font-medium px-2.5 py-1 rounded-lg border border-viora-border capitalize focus:outline-none cursor-pointer"
                          >
                            <option value="user">User</option>
                            <option value="creator">Creator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5">
                          {u.isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              <XCircle className="w-3 h-3" />
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                          {formatDateAgo(u.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleToggleSuspension(u._id, u.isSuspended)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              u.isSuspended
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
                            }`}
                          >
                            {u.isSuspended ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Reactivate</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Suspend</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Video Moderation */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-viora-card p-3 rounded-2xl border border-viora-border">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search videos by title..."
                value={videoSearch}
                onChange={(e) => setVideoSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-viora-surface rounded-xl text-xs border border-viora-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={fetchVideos}
              className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-viora-card rounded-3xl border border-viora-border overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-viora-surface text-slate-400 uppercase tracking-wider font-semibold border-b border-viora-border text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Video</th>
                    <th className="px-4 py-3.5">Uploader</th>
                    <th className="px-4 py-3.5">Views</th>
                    <th className="px-4 py-3.5">Visibility</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-viora-border/60">
                  {loadingVideos ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">Loading videos...</td>
                    </tr>
                  ) : videos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">No videos found.</td>
                    </tr>
                  ) : (
                    videos.map((v) => (
                      <tr key={v._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={v.thumbnailUrl}
                              alt={v.title}
                              className="w-16 aspect-video rounded-lg object-cover border border-viora-border"
                            />
                            <span className="font-medium text-slate-200 line-clamp-1 max-w-xs">
                              {v.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400">
                          @{v.owner?.username || 'Unknown'}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-300">
                          {formatViews(v.views)}
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={v.visibility || 'public'}
                            onChange={(e) => handleVisibilityChange(v._id, e.target.value)}
                            className="bg-viora-surface text-slate-200 font-medium px-2.5 py-1 rounded-lg border border-viora-border capitalize focus:outline-none cursor-pointer"
                          >
                            <option value="public">Public</option>
                            <option value="unlisted">Unlisted</option>
                            <option value="private">Private</option>
                          </select>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteVideo(v._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Reports Resolution */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-viora-card p-3 rounded-2xl border border-viora-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Status Filter:</span>
              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-viora-surface rounded-xl text-xs border border-viora-border text-slate-200 focus:outline-none capitalize"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <button
              onClick={fetchReports}
              className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {loadingReports ? (
              <div className="py-12 text-center text-slate-400">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="py-12 text-center text-slate-400">No reports found for this filter.</div>
            ) : (
              reports.map((r) => (
                <div
                  key={r._id}
                  className="p-5 bg-viora-card rounded-2xl border border-viora-border space-y-3 shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-viora-border/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                        r.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : r.status === 'resolved'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/5 text-slate-300 border-white/10'
                      }`}>
                        {r.status}
                      </span>
                      <span className="font-semibold text-xs text-slate-200 capitalize">
                        Target: {r.targetType}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ({r.targetId})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {formatDateAgo(r.createdAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Reason: </span>
                      <strong className="text-rose-400 capitalize">{r.reason.replace('_', ' ')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Reported By: </span>
                      <strong className="text-slate-200">@{r.reportedBy?.username || 'Unknown'}</strong>
                    </div>
                  </div>

                  {r.description && (
                    <p className="text-xs text-slate-300 bg-viora-surface p-3 rounded-xl border border-viora-border/50 italic">
                      "{r.description}"
                    </p>
                  )}

                  {r.resolutionNotes && (
                    <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                      <strong>Resolution:</strong> {r.resolutionNotes}
                    </div>
                  )}

                  {r.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setResolutionPrompt({ reportId: r._id, status: 'dismissed' })}
                        className="px-3.5 py-1.5 rounded-xl border border-viora-border text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Dismiss
                      </button>
                      <Button
                        onClick={() => setResolutionPrompt({ reportId: r._id, status: 'resolved' })}
                        variant="primary"
                        size="sm"
                      >
                        Resolve & Moderate
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Resolution Notes Modal */}
      {resolutionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-viora-surface border border-viora-border rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-100 capitalize">
              {resolutionPrompt.status} Report
            </h3>
            <p className="text-xs text-slate-400">
              Provide optional resolution notes for platform audit logs:
            </p>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Video set to private or comment deleted."
              className="w-full px-3 py-2 bg-viora-card border border-viora-border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setResolutionPrompt(null)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
              >
                Cancel
              </button>
              <Button
                onClick={handleResolveReport}
                variant="primary"
                size="sm"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
