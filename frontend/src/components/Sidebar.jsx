import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiHome, HiUsers, HiDocumentText, HiArrowRightOnRectangle,
  HiPlusCircle, HiShieldCheck, HiCpuChip, HiArrowPath,
  HiChartBarSquare, HiBell, HiCog6Tooth, HiChevronLeft, HiChevronRight
} from 'react-icons/hi2';
import { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Sidebar = ({ user, collapsed, onToggle }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then(res => setUnreadCount(res.data?.count || 0))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: HiHome },
    { path: '/ai-command', name: 'AI Command', icon: HiCpuChip },
    { path: '/policies', name: 'Policies', icon: HiDocumentText },
    { path: '/policies/new', name: 'New Policy', icon: HiPlusCircle },
    { path: '/renewals', name: 'Renewals', icon: HiArrowPath },
    { path: '/customers', name: 'Customers', icon: HiUsers },
    { path: '/analytics', name: 'Analytics', icon: HiChartBarSquare },
    { path: '/notifications', name: 'Notifications', icon: HiBell, badge: unreadCount },
    { path: '/settings', name: 'Settings', icon: HiCog6Tooth },
  ];

  return (
    <div className="h-full flex flex-col text-slate-300">
      {/* Logo */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <ShieldLogo />
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden whitespace-nowrap">
                <h1 className="text-sm font-bold text-white tracking-widest font-mono uppercase">MassMutual</h1>
                <p className="text-[8px] text-slate-500 uppercase tracking-[0.2em]">Renewal System</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={onToggle} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          {collapsed ? <HiChevronRight className="w-4 h-4" /> : <HiChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* System Status */}
      {!collapsed && (
        <div className="px-4 py-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-400 tracking-wider">SYSTEM ONLINE</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="p-2 flex-1 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.name : undefined}
            className={({ isActive }) =>
              `flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 rounded-lg border-l-2 transition-all duration-200 group font-mono text-xs relative ${
                isActive
                  ? 'bg-white/10 text-white border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                  : 'border-transparent hover:bg-white/5 hover:text-slate-200 hover:border-slate-600'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="tracking-wider whitespace-nowrap">
                  {item.name.toUpperCase()}
                </motion.span>
              )}
            </AnimatePresence>
            {item.badge > 0 && (
              <span className={`${collapsed ? 'absolute -top-0.5 -right-0.5' : 'ml-auto'} bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1`}>
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} mb-3 px-1`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center text-amber-400 font-mono font-bold text-sm border border-amber-500/30 shrink-0">
            {user?.name?.[0] || 'U'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-mono text-xs text-white truncate">{user?.name}</p>
              <p className="text-[9px] text-slate-500 truncate uppercase tracking-widest">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-2'} px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20 hover:border-red-500/30 font-mono text-[10px] tracking-wider uppercase`}
        >
          <HiArrowRightOnRectangle className="w-3.5 h-3.5" />
          {!collapsed && <span>Terminate</span>}
        </button>
      </div>
    </div>
  );
};

const ShieldLogo = () => (
  <HiShieldCheck className="text-amber-400 w-6 h-6 shrink-0" />
);

export default Sidebar;
