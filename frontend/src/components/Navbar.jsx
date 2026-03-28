import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';
import { HiBars3, HiXMark } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'Widgets', path: '/widgets' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center backdrop-blur-sm bg-black/0">
      <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
        <div className="relative">
          <FaShieldAlt className="text-blue-500 text-xl group-hover:text-blue-400 transition-colors" />
          <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
        </div>
        <span className="text-white/90 font-medium tracking-widest text-sm font-mono uppercase group-hover:text-white transition-colors">MassMutual</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {navLinks.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`text-sm font-medium transition-colors tracking-wide ${
              isActive(item.path) ? 'text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            {item.name}
          </Link>
        ))}

        {user ? (
          <Link
            to="/dashboard"
            className="px-6 py-2 flex items-center gap-2 text-white border border-white/20 hover:border-white/50 hover:bg-white/5 rounded-full font-medium text-sm transition-all transform hover:scale-105"
          >
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold">
              {user.name?.[0] || 'U'}
            </span>
            Dashboard
          </Link>
        ) : (
          <Link
            to="/login"
            className="px-6 py-2 text-white border border-white/20 hover:border-white/50 hover:bg-white/5 rounded-full font-medium text-sm transition-all transform hover:scale-105"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <HiBars3 className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <Link to="/" className="flex items-center space-x-3">
                <FaShieldAlt className="text-blue-500 text-xl" />
                <span className="text-white font-medium tracking-widest text-sm font-mono uppercase">MassMutual</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <HiXMark className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col space-y-6 flex-1">
              {navLinks.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={`text-2xl font-bold tracking-tight transition-colors ${
                      isActive(item.path) ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full py-3 flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-all"
                >
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {user.name?.[0] || 'U'}
                  </span>
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="w-full py-3 text-center text-white bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-all block"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
