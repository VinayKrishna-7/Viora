import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Lock, 
  Trash2, 
  LogOut, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Image as ImageIcon
} from 'lucide-react';
import { updateUserProfile, logoutUser } from '../../store/slices/authSlice';
import { changePasswordApi, deleteAccountApi } from '../../services/authService';

export const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { isSubmitting: isProfileSubmitting },
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      description: user?.description || '',
      avatar: user?.avatar || '',
      banner: user?.banner || '',
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm();

  const onProfileSubmit = async (data) => {
    setProfileSuccess('');
    setProfileError('');
    try {
      await dispatch(updateUserProfile(data)).unwrap();
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordSuccess('');
    setPasswordError('');
    setIsPasswordSubmitting(true);
    try {
      await changePasswordApi(data);
      setPasswordSuccess('Password changed successfully!');
      resetPasswordForm();
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccountApi();
      dispatch(logoutUser());
    } catch (err) {
      alert(err.message || 'Failed to delete account');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="border-b border-white/5 pb-5">
        <h1 className="text-2xl font-black text-white tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your account preferences, channel profile, and security credentials
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Channel</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'security'
              ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security</span>
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-viora-card/50 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
            <div className="flex items-center gap-4 pb-2">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={user?.username}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/40 shadow-lg"
              />
              <div>
                <p className="font-bold text-white text-base">@{user?.username}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                {...registerProfile('username')}
                className="w-full px-3.5 py-2.5 bg-viora-card border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Channel Description
              </label>
              <textarea
                rows={3}
                placeholder="Tell viewers about your channel..."
                {...registerProfile('description')}
                className="w-full px-3.5 py-2.5 bg-viora-card border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Avatar Image URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                {...registerProfile('avatar')}
                className="w-full px-3.5 py-2.5 bg-viora-card border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Banner Image URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                {...registerProfile('banner')}
                className="w-full px-3.5 py-2.5 bg-viora-card border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={isProfileSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {isProfileSubmitting ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="bg-viora-card/50 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-lg font-bold text-white">Change Password</h2>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('currentPassword', {
                    required: 'Current password is required',
                  })}
                  className="w-full px-3.5 py-2.5 bg-viora-card border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="w-full px-3.5 py-2.5 bg-viora-card border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-rose-400 mt-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPasswordSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {isPasswordSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-rose-400">Danger Zone</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Permanently delete your account, your channel, all your uploaded videos, comments, and playlists. This action is irreversible.
            </p>

            {showDeleteConfirm ? (
              <div className="p-4 bg-viora-surface rounded-2xl border border-rose-500/30 space-y-3">
                <p className="text-xs font-semibold text-rose-400">
                  Are you absolutely sure you want to delete your account? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 shadow-md"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold rounded-xl text-xs transition"
              >
                Delete Account
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
