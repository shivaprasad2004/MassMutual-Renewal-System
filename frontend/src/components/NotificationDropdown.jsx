import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiBell, HiExclamationTriangle, HiCpuChip, HiArrowPath, HiCog6Tooth } from 'react-icons/hi2';
import api from '../services/api';

const NotificationDropdown = ({ onClose, onCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/notifications?limit=5')
      .then(res => {
        setNotifications(res.data?.notifications || res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const getIcon = (type) => {
    switch (type) {
      case 'risk_alert': return HiExclamationTriangle;
      case 'ai_insight': return HiCpuChip;
      case 'renewal_alert': return HiArrowPath;
      default: return HiCog6Tooth;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/10';
      case 'high': return 'text-amber-400 bg-amber-500/10';
      case 'medium': return 'text-blue-400 bg-blue-500/10';
      default: return 'text-slate-400 bg-white/5';
    }
  };

  const markAsRead = async (id) => {
    await api.put(`/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (onCountChange) {
      const unread = notifications.filter(n => !n.read && n.id !== id).length;
      onCountChange(unread);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute right-0 top-12 w-80 glass-panel border border-white/10 shadow-2xl z-50 overflow-hidden"
    >
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-white tracking-wider">NOTIFICATIONS</span>
        <button
          onClick={() => { navigate('/notifications'); onClose(); }}
          className="text-[10px] font-mono text-amber-400 hover:text-amber-300"
        >
          VIEW ALL
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-slate-500 text-xs font-mono">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center">
            <HiBell className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-xs text-slate-500 font-mono">No notifications</p>
          </div>
        ) : (
          notifications.map(notif => {
            const Icon = getIcon(notif.type);
            return (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!notif.read ? 'bg-white/[0.02]' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-lg ${getPriorityColor(notif.priority)}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-mono truncate ${notif.read ? 'text-slate-400' : 'text-white font-bold'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{notif.message}</p>
                    <p className="text-[9px] text-slate-600 mt-0.5 font-mono">
                      {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default NotificationDropdown;
