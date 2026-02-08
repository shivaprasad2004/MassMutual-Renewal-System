import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';
import GlobalNetworkScene from '../components/GlobalNetworkScene';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-end relative bg-black overflow-hidden pr-4 md:pr-20">
      {/* Full Background 3D Scene */}
      <GlobalNetworkScene />

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FaShieldAlt className="text-amber-400 text-xl" />
            <h2 className="text-xl font-bold text-white tracking-tight font-mono">SECURE ACCESS</h2>
          </div>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em]">MassMutual Policy System</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <FaEnvelope className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
                placeholder="name@massmutual.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-8">
            <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">Password</label>
            <div className="relative group">
              <FaLock className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="password"
                className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all font-semibold shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-slate-700/50 pt-6">
           <p className="text-slate-500 text-sm mb-2">
             Don't have an account?{' '}
             <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
               Sign Up
             </Link>
           </p>
           <p className="text-slate-600 text-xs">Protected by MassMutual Security Systems</p>
        </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
