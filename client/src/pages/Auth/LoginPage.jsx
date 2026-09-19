import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { loginUser, clearAuthError } from '../../store/slices/authSlice';
import Button from '../../components/ui/Button';

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isSubmitting, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    dispatch(clearAuthError());
    const resultAction = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-viora-bg text-slate-100 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-8 sm:p-10 bg-viora-card/90 backdrop-blur-2xl border border-viora-border rounded-3xl shadow-2xl space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg className="w-5 h-5 text-white fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-display">
              Vio<span className="text-indigo-400">ra</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-400">
            Sign in to access your channel, subscriptions, and library
          </p>
        </div>

        {/* Server Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email or Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Enter your email or username"
                {...register('email', {
                  required: 'Email or Username is required',
                  minLength: {
                    value: 3,
                    message: 'Must be at least 3 characters',
                  },
                })}
                className={`w-full pl-10 pr-4 py-2.5 bg-viora-surface border ${
                  errors.email
                    ? 'border-rose-500/60 focus:border-rose-500'
                    : 'border-viora-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
                } rounded-xl text-sm focus:outline-none transition-all text-slate-100 placeholder-slate-500`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className={`w-full pl-10 pr-11 py-2.5 bg-viora-surface border ${
                  errors.password
                    ? 'border-rose-500/60 focus:border-rose-500'
                    : 'border-viora-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
                } rounded-xl text-sm focus:outline-none transition-all text-slate-100 placeholder-slate-500`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            className="w-full py-3 mt-3 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer info */}
        <div className="pt-2 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors underline-offset-2 hover:underline ml-1"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
