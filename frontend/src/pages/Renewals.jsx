import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiArrowPath, HiCalendarDays, HiViewColumns, HiBell,
  HiChevronLeft, HiChevronRight, HiFunnel
} from 'react-icons/hi2';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import KanbanBoard from '../components/ui/KanbanBoard';
import RiskBadge from '../components/ui/RiskBadge';

const Renewals = () => {
  const [pipeline, setPipeline] = useState({ upcoming: [], in_progress: [], completed: [], lapsed: [] });
  const [calendar, setCalendar] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban');
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedIds, setSelectedIds] = useState([]);
  const { socket } = useSocket();

  const fetchPipeline = async () => {
    try {
      const res = await api.get('/renewals/pipeline');
      setPipeline(res.data);
    } catch (err) {
      console.error('Error fetching pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendar = async () => {
    try {
      const res = await api.get(`/renewals/calendar?month=${calMonth}&year=${calYear}`);
      setCalendar(res.data.calendar || {});
    } catch (err) {
      console.error('Error fetching calendar:', err);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  useEffect(() => {
    if (view === 'calendar') fetchCalendar();
  }, [view, calMonth, calYear]);

  useEffect(() => {
    if (socket) {
      socket.on('renewal_update', fetchPipeline);
      return () => socket.off('renewal_update', fetchPipeline);
    }
  }, [socket]);

  const handleMoveCard = async (renewalId, fromCol, toCol) => {
    // Optimistic update
    setPipeline(prev => {
      const item = prev[fromCol].find(i => i.id === renewalId);
      if (!item) return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter(i => i.id !== renewalId),
        [toCol]: [{ ...item, stage: toCol }, ...prev[toCol]]
      };
    });

    try {
      await api.put(`/renewals/${renewalId}/stage`, { stage: toCol });
    } catch (err) {
      console.error('Error updating stage:', err);
      fetchPipeline(); // revert
    }
  };

  const handleBatchRemind = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await api.post('/renewals/batch-remind', { renewal_ids: selectedIds });
      setSelectedIds([]);
      alert(`Reminders sent for ${res.data.count} renewals`);
    } catch (err) {
      console.error('Error sending reminders:', err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totalRenewals = Object.values(pipeline).reduce((sum, col) => sum + col.length, 0);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const navigateMonth = (dir) => {
    let m = calMonth + dir;
    let y = calYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCalMonth(m);
    setCalYear(y);
  };

  // Build calendar grid
  const buildCalendarGrid = () => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const weeks = [];
    let currentWeek = new Array(firstDay).fill(null);

    for (let d = 1; d <= daysInMonth; d++) {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    return weeks;
  };

  const getDateKey = (day) => {
    if (!day) return null;
    const d = new Date(calYear, calMonth, day);
    return d.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
          <p className="text-white font-mono text-sm animate-pulse uppercase tracking-[0.2em]">LOADING RENEWAL PIPELINE...</p>
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
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">RENEWALS</h1>
          <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest">
            Pipeline Tracker • {totalRenewals} Active Renewals
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button onClick={handleBatchRemind} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-mono text-xs uppercase tracking-widest transition-all border border-amber-400/20">
              <HiBell className="w-4 h-4" /> Remind ({selectedIds.length})
            </button>
          )}

          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest rounded transition-all flex items-center gap-1.5 ${
                view === 'kanban' ? 'bg-white/10 text-white border border-white/20' : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <HiViewColumns className="w-4 h-4" /> Pipeline
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest rounded transition-all flex items-center gap-1.5 ${
                view === 'calendar' ? 'bg-white/10 text-white border border-white/20' : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <HiCalendarDays className="w-4 h-4" /> Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Upcoming', count: pipeline.upcoming.length, color: 'blue' },
          { label: 'In Progress', count: pipeline.in_progress.length, color: 'amber' },
          { label: 'Completed', count: pipeline.completed.length, color: 'emerald' },
          { label: 'Lapsed', count: pipeline.lapsed.length, color: 'red' },
        ].map((s) => (
          <div key={s.label} className={`glass-card p-4 tech-border border-l-2 border-l-${s.color}-500/40`}>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold text-${s.color}-400 font-mono`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <KanbanBoard columns={pipeline} onMoveCard={handleMoveCard} />
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="glass-card p-6 tech-border">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white">
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-white font-bold font-mono uppercase tracking-widest">
              {monthNames[calMonth]} {calYear}
            </h3>
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white">
              <HiChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-mono text-slate-500 uppercase tracking-wider py-2">{d}</div>
            ))}

            {buildCalendarGrid().flat().map((day, i) => {
              const dateKey = getDateKey(day);
              const events = dateKey ? (calendar[dateKey] || []) : [];
              const isToday = day && new Date().toISOString().split('T')[0] === dateKey;

              return (
                <div
                  key={i}
                  className={`min-h-[80px] rounded-lg border p-1.5 transition-all ${
                    day ? 'border-white/5 hover:border-white/20 bg-black/20' : 'border-transparent'
                  } ${isToday ? 'border-blue-500/40 bg-blue-500/5' : ''} ${events.length > 0 ? 'border-amber-500/30' : ''}`}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-mono ${isToday ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>{day}</span>
                      <div className="mt-1 space-y-0.5">
                        {events.slice(0, 3).map((ev, j) => (
                          <div key={j} className="text-[8px] font-mono truncate px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {ev.policy_number}
                          </div>
                        ))}
                        {events.length > 3 && (
                          <div className="text-[8px] text-slate-500 font-mono text-center">+{events.length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Renewals;
