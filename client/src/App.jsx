import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if auth token is passed in URL query param for dev/preview sessions
    const params = new URLSearchParams(window.location.search);
    const token = params.get('auth_token');
    if (token) {
      localStorage.setItem('viora_token', token);
    }
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white transition-colors duration-200">
        <AppRoutes />
      </div>
    </ErrorBoundary>
  );
}

export default App;
