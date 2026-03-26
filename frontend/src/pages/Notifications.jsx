import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiBell, HiCheckCircle, HiTrash, HiExclamationTriangle,
  HiInformationCircle, HiCheck, HiFunnel, HiArrowPath
} from 'react-icons/hi2';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : res.data?.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('notification_new', fetchNotifications);
      return () => socket.off('notification_new', fetchNotifications);
    }
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'alert': case 'warning': return <HiExclamationTriangle className="w-5 h-5 text-amber-400" />;
      case 'success': return <HiCheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error': case 'critical': return <HiExclamationTriangle className="w-5 h-5 text-red-400" />;
      default: return <HiInformationCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': case 'critical': return 'border-l-red-500/50';
      case 'medium': return 'border-l-amber-500/50';
      default: return 'border-l-blue-500/50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
          <p className="text-white font-mono text-sm animate-pulse uppercase tracking-[0.2em]">LOADING NOTIFICATIONS...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
            NOTIFICATIONS
            {unreadCount > 0 && (
              <span className="text-sm bg-red-500 text-white px-2.5 py-1 rounded-full font-mono">{unreadCount}</span>
            )}
          </h1>
          <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest">
            System Alerts & Updates • {notifications.length} Total
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-xs uppercase tracking-widest transition-all border border-blue-400/20">
              <HiCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest rounded transition-all ${
                  filter === f ? 'bg-white/10 text-white border border-white/20' : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: i * 0.03 }}
              className={`glass-card p-4 tech-border border-l-2 ${getPriorityColor(n.priority)} ${
                !n.read ? 'bg-white/[0.03]' : 'opacity-70'
              } hover:opacity-100 transition-all group`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white font-mono uppercase tracking-tight truncate">
                      {n.title}
                    </h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {n.priority && (
                      <span className={`text-[10px] font-mono uppercase tracking-wider ${
                        n.priority === 'high' || n.priority === 'critical' ? 'text-red-400' :
                        n.priority === 'medium' ? 'text-amber-400' : 'text-slate-500'
                      }`}>
                        {n.priority}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)} className="p-1.5 hover:bg-blue-500/10 rounded text-slate-400 hover:text-blue-400 transition-colors" title="Mark as read">
                      <HiCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} className="p-1.5 hover:bg-red-500/10 rounded text-slate-400 hover:text-red-400 transition-colors" title="Delete">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-4">
              <HiBell className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">No Notifications</h3>
            <p className="text-sm text-slate-400 mt-1">
              {filter === 'unread' ? "You're all caught up!" : "No notifications to display"}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;
