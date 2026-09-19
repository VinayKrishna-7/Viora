import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import Button from '../components/ui/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-slate-100 font-display">404 - Channel or Page Not Found</h1>
      <p className="text-slate-400 max-w-md text-sm leading-relaxed">
        This destination doesn't exist or may have been relocated. Discover other releases or return to the main feed.
      </p>
      <Button
        to="/"
        variant="primary"
        className="flex items-center gap-2 mt-2"
      >
        <Home className="w-4 h-4" />
        <span>Back to Discover Feed</span>
      </Button>
    </div>
  );
};

export default NotFoundPage;
