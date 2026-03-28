import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import GlobalNetworkScene from '../components/GlobalNetworkScene';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        console.error('Login error details:', res.error);
        const errorMessage = res.error || 'Login failed';
        setError(errorMessage);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error details:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Network error - check if backend is running';
      setError(`Login failed: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.1 + i * 0.1, duration: 0.4, ease: 'easeOut' }
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-end relative bg-black overflow-hidden pr-4 md:pr-20">
      <GlobalNetworkScene />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <FaShieldAlt className="text-amber-400 text-xl" />
            <h2 className="text-xl font-bold text-white tracking-tight font-mono">SECURE ACCESS</h2>
          </div>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em]">MassMutual Policy System</p>
        </motion.div>

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
          <motion.div className="mb-5" custom={0} variants={fieldVariants} initial="hidden" animate="visible">
            <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <FaEnvelope className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                placeholder="name@massmutual.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </motion.div>
          <motion.div className="mb-8" custom={1} variants={fieldVariants} initial="hidden" animate="visible">
            <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">Password</label>
            <div className="relative group">
              <FaLock className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 pl-10 pr-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </motion.div>
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all font-semibold shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 click-scale"
            custom={2}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </motion.button>
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
