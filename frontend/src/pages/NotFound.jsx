import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaTachometerAlt } from 'react-icons/fa';

const NotFound = () => {
  const [timestamp, setTimestamp] = useState(new Date().toISOString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date().toISOString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden text-white font-mono">

      {/* --- Inline keyframe styles for glitch, blobs, particles, scanline --- */}
      <style>{`
        @keyframes glitch {
          0%, 100% { text-shadow: 2px 0 #3b82f6, -2px 0 #f59e0b; transform: translate(0); }
          10% { text-shadow: -2px -2px #3b82f6, 2px 2px #f59e0b; transform: translate(-2px, 1px); }
          20% { text-shadow: 2px -1px #3b82f6, -2px 1px #f59e0b; transform: translate(2px, -1px); }
          30% { text-shadow: -1px 2px #3b82f6, 1px -2px #f59e0b; transform: translate(-1px, 2px); }
          40% { text-shadow: 1px -1px #3b82f6, -1px 1px #f59e0b; transform: translate(1px, -1px); }
          50% { text-shadow: -2px 1px #3b82f6, 2px -1px #f59e0b; transform: translate(-2px, 1px); }
          60% { text-shadow: 2px 2px #3b82f6, -2px -2px #f59e0b; transform: translate(2px, 2px); }
          70% { text-shadow: -1px -1px #3b82f6, 1px 1px #f59e0b; transform: translate(0); }
          80% { text-shadow: 1px 2px #3b82f6, -1px -2px #f59e0b; transform: translate(-1px, 2px); }
          90% { text-shadow: -2px -2px #3b82f6, 2px 2px #f59e0b; transform: translate(2px, -1px); }
        }
        @keyframes glitchFlicker {
          0%, 100% { opacity: 1; }
          42% { opacity: 1; }
          43% { opacity: 0.4; }
          44% { opacity: 1; }
          78% { opacity: 1; }
          79% { opacity: 0.6; }
          80% { opacity: 1; }
        }
        @keyframes blobPulse1 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.12; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.2; }
        }
        @keyframes blobPulse2 {
          0%, 100% { transform: translate(50%, 50%) scale(1.2); opacity: 0.1; }
          50% { transform: translate(50%, 50%) scale(0.9); opacity: 0.18; }
        }
        @keyframes floatParticle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        @keyframes scanline {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        .glitch-text {
          animation: glitch 3s infinite, glitchFlicker 5s infinite;
        }
        .blob-1 {
          animation: blobPulse1 6s ease-in-out infinite;
        }
        .blob-2 {
          animation: blobPulse2 8s ease-in-out infinite;
        }
      `}</style>

      {/* --- Animated gradient blobs --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="blob-1 absolute w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{
            top: '30%', left: '25%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 70%)',
          }}
        />
        <div
          className="blob-2 absolute w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{
            bottom: '20%', right: '20%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* --- Grid overlay --- */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* --- Scanline --- */}
      <div
        className="absolute left-0 w-full h-[2px] z-[2] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)',
          animation: 'scanline 4s linear infinite',
        }}
      />

      {/* --- Floating particles --- */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              bottom: '-5%',
              background: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#f59e0b' : 'rgba(255,255,255,0.4)',
              animation: `floatParticle ${Math.random() * 8 + 6}s linear ${Math.random() * 6}s infinite`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* --- Main content --- */}
      <div className="relative z-10 text-center px-6 py-12 max-w-2xl mx-auto flex flex-col items-center">

        {/* Error badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <span
            className="inline-block px-4 py-1.5 text-xs uppercase tracking-[0.3em] rounded-full border border-red-500/30 text-red-400 backdrop-blur-sm"
            style={{ background: 'rgba(239,68,68,0.08)' }}
          >
            &bull; System Alert &mdash; Route Failure
          </span>
        </motion.div>

        {/* Glitch 404 */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25, type: 'spring', stiffness: 120 }}
          className="glitch-text text-[8rem] sm:text-[10rem] md:text-[12rem] font-extrabold leading-none tracking-tighter select-none"
          style={{ color: 'rgba(255,255,255,0.9)' }}
        >
          404
        </motion.h1>

        {/* SIGNAL LOST subtitle */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-lg sm:text-xl uppercase tracking-[0.35em] text-amber-500 mt-2 mb-6 font-mono font-semibold"
        >
          Signal Lost
        </motion.h2>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="w-48 h-px mx-auto mb-8"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)' }}
        />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          className="text-sm sm:text-base text-slate-500 uppercase tracking-wider leading-relaxed max-w-lg mx-auto mb-12"
        >
          The requested endpoint could not be located in our network.
          The page may have been decommissioned or the route is invalid.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <Link
            to="/"
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm uppercase tracking-[0.2em] font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
          >
            <FaShieldAlt className="text-xs opacity-80 group-hover:scale-110 transition-transform" />
            Return to Base
          </Link>
          <Link
            to="/dashboard"
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 text-sm uppercase tracking-[0.2em] font-semibold rounded-lg transition-all duration-300 border border-slate-700 hover:border-blue-500/50 text-slate-400 hover:text-white backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <FaTachometerAlt className="text-xs opacity-80 group-hover:scale-110 transition-transform" />
            Go to Dashboard
          </Link>
        </motion.div>

        {/* Glassmorphic info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.05 }}
          className="w-full max-w-lg rounded-xl border border-slate-800/60 px-6 py-4 backdrop-blur-md"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-600">
            <span>
              Error_Code: <span className="text-red-400/80">404</span>
            </span>
            <span className="hidden sm:inline text-slate-800">|</span>
            <span>
              Timestamp: <span className="text-blue-400/70">{timestamp}</span>
            </span>
            <span className="hidden sm:inline text-slate-800">|</span>
            <span>
              Node: <span className="text-amber-500/70">Frontend_Router</span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
