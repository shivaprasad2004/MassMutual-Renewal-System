import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiMagnifyingGlass, HiBell, HiCommandLine } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import NotificationDropdown from './NotificationDropdown';

const Header = ({ onOpenSearch }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then(res => setUnreadCount(res.data?.count || 0))
      .catch(() => {});
  }, [location.pathname]);

  // Breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, i) => ({
    label: part.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
    path: '/' + pathParts.slice(0, i + 1).join('/')
  }));

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/30 backdrop-blur-sm">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-2">
            {i > 0 && <span className="text-slate-700">/</span>}
            <span className={i === breadcrumbs.length - 1 ? 'text-white' : ''}>
              {crumb.label.toUpperCase()}
            </span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all text-xs font-mono"
        >
          <HiMagnifyingGlass className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline text-[9px] bg-white/10 px-1.5 py-0.5 rounded border border-white/10">Ctrl+K</kbd>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <HiBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <NotificationDropdown
                onClose={() => setShowNotifications(false)}
                onCountChange={setUnreadCount}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono text-emerald-400 tracking-wider">LIVE</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
