import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]">
      <div className="relative mb-8">
        <FaShieldAlt className="text-blue-500 text-5xl animate-pulse" />
        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
      </div>
      <p className="text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Initializing System...
      </p>
      <div className="mt-6 w-48 h-0.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full animate-loading-bar" />
      </div>
    </div>
  );
};

export default LoadingScreen;
