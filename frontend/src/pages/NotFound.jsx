import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center p-8 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaExclamationTriangle className="text-6xl text-amber-500 mx-auto mb-6" />
          <h1 className="text-8xl font-bold font-mono mb-2 tracking-tighter text-white/90">404</h1>
          <h2 className="text-2xl font-semibold mb-6 text-slate-400 uppercase tracking-widest">Page Not Found</h2>
          <p className="text-slate-500 mb-10 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/25 group"
          >
            <FaHome className="group-hover:-translate-y-0.5 transition-transform" />
            Return Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
