import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useNavigate, Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import TelemetryStream from '../components/TelemetryStream';
const AIInsights = React.lazy(() => import('../components/AIInsights'));
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import {
  HiClipboardDocumentCheck as ClipboardDocumentCheckIcon,
  HiExclamationTriangle as ExclamationTriangleIcon,
  HiCheckCircle as CheckCircleIcon,
  HiArrowPath as ArrowPathIcon,
  HiCpuChip as CpuChipIcon,
  HiSignal as SignalIcon,
  HiBeaker as BeakerIcon,
  HiCommandLine as CommandLineIcon,
  HiPlus, HiSparkles, HiArrowDownTray,
  HiClock,
  HiChartBar,
  HiCurrencyDollar,
  HiShieldCheck,
  HiUsers,
  HiArrowTrendingUp,
  HiChevronRight,
  HiDocumentText,
  HiBolt,
  HiCalendarDays,
  HiArrowRight
} from 'react-icons/hi2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_COLORS = {
  Active: 'emerald',
  Lapsed: 'red',
  Renewed: 'blue',
  Pending: 'amber',
};

const getDaysUntil = (dateStr) => {
  if (!dateStr) return Infinity;
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
};

const urgencyColor = (days) => {
  if (days <= 3) return { text: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500/30', glow: 'shadow-red-500/20' };
  if (days <= 7) return { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' };
  if (days <= 14) return { text: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/20' };
  return { text: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' };
};

const formatCurrency = (val) => {
  if (val == null || isNaN(val)) return '₹0';
  if (val >= 1_000_000) return `₹${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(1)}K`;
  return `₹${Number(val).toLocaleString('en-IN')}`;
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const fadeSlide = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, type: 'spring', stiffness: 260, damping: 20 }
  })
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const QuickNavCard = ({ to, icon: Icon, title, description, color, delay = 0 }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="group"
  >
    <Link
      to={to}
      className={`glass-card tech-border p-5 flex items-start gap-4 h-full hover:border-${color}-500/40 transition-all duration-300 relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/[0.02] group-hover:to-white/[0.05] transition-all" />
      <div className={`p-2.5 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 group-hover:bg-${color}-500/20 transition-colors shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0 relative z-10">
        <h4 className="text-white font-bold text-sm uppercase tracking-wide group-hover:text-blue-400 transition-colors">{title}</h4>
        <p className="text-slate-500 text-[11px] font-mono mt-1 leading-relaxed">{description}</p>
      </div>
      <HiChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all mt-1 shrink-0" />
    </Link>
  </motion.div>
);

const RenewalCountdownItem = ({ renewal, index }) => {
  const days = getDaysUntil(renewal.renewal_date || renewal.end_date);
  const colors = urgencyColor(days);
  const displayDays = Math.max(0, days);

  return (
    <motion.div
      custom={index}
      variants={fadeSlide}
      initial="hidden"
      animate="visible"
      className={`flex items-center gap-4 p-3 rounded-lg border ${colors.border} bg-white/[0.02] hover:bg-white/[0.04] transition-all group`}
    >
      {/* Day counter badge */}
      <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${colors.bg}/10 border ${colors.border} shrink-0`}>
        <span className={`text-lg font-black font-mono ${colors.text}`}>{displayDays}</span>
        <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">DAYS</span>
      </div>

      {/* Policy info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-bold font-mono truncate">
            {renewal.policy_number || renewal.policyNumber || `POL-${renewal.id}`}
          </span>
          {renewal.status && (
            <span className={`px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-widest rounded bg-${STATUS_COLORS[renewal.status] || 'slate'}-500/10 text-${STATUS_COLORS[renewal.status] || 'slate'}-400 border border-${STATUS_COLORS[renewal.status] || 'slate'}-500/20`}>
              {renewal.status}
            </span>
          )}
        </div>
        <p className="text-slate-500 text-[10px] font-mono mt-0.5 truncate">
          {renewal.holder_name || renewal.holderName || 'N/A'} &bull; {renewal.type || renewal.policy_type || 'STANDARD'}
        </p>
        {renewal.premium && (
          <p className="text-slate-600 text-[10px] font-mono">{formatCurrency(renewal.premium)}/yr</p>
        )}
      </div>

      {/* Renewal date */}
      <div className="text-right shrink-0">
        <p className={`text-[10px] font-mono ${colors.text}`}>
          {new Date(renewal.renewal_date || renewal.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
        <p className="text-[8px] text-slate-600 font-mono uppercase">
          {new Date(renewal.renewal_date || renewal.end_date).getFullYear()}
        </p>
      </div>
    </motion.div>
  );
};

const RenewalHealthBar = ({ completed, total }) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const barColor = pct >= 75 ? 'emerald' : pct >= 50 ? 'amber' : 'red';

  return (
    <motion.div variants={itemVariants} className="glass-card tech-border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HiShieldCheck className={`w-4 h-4 text-${barColor}-400`} />
          <h4 className="text-white font-bold text-xs uppercase tracking-widest font-mono">Renewal Health</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-${barColor}-400 text-sm font-black font-mono`}>{pct}%</span>
          <span className="text-slate-600 text-[10px] font-mono">({completed}/{total})</span>
        </div>
      </div>
      <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
        <motion.div
          className={`h-full bg-gradient-to-r from-${barColor}-600 to-${barColor}-400 rounded-full shadow-[0_0_12px] shadow-${barColor}-500/40`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
      <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-600 uppercase tracking-widest">
        <span>0%</span>
        <span>Target: 85%</span>
        <span>100%</span>
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPolicies: 0,
    upcomingRenewals: 0,
    overduePolicies: 0,
    totalPremium: 0,
    averagePremium: 0,
    completedRenewals: 0,
    totalRenewals: 0,
  });
  const [activities, setActivities] = useState([]);
  const [renewalPipeline, setRenewalPipeline] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { socket } = useSocket();
  const navigate = useNavigate();

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, activityRes, pipelineRes, healthRes] = await Promise.allSettled([
        api.get('/policies/stats'),
        api.get('/auth/activities?limit=10'),
        api.get('/renewals/pipeline'),
        api.get('/analytics/health'),
      ]);

      if (statsRes.status === 'fulfilled') {
        const s = statsRes.value.data;
        setStats((prev) => ({
          ...prev,
          totalPolicies: s.totalPolicies ?? s.total_policies ?? prev.totalPolicies,
          upcomingRenewals: s.upcomingRenewals ?? s.upcoming_renewals ?? prev.upcomingRenewals,
          overduePolicies: s.overduePolicies ?? s.overdue_policies ?? prev.overduePolicies,
          totalPremium: s.totalPremium ?? s.total_premium ?? prev.totalPremium,
          averagePremium: s.averagePremium ?? s.average_premium ?? prev.averagePremium,
          completedRenewals: s.completedRenewals ?? s.completed_renewals ?? prev.completedRenewals,
          totalRenewals: s.totalRenewals ?? s.total_renewals ?? (s.upcomingRenewals ?? 0) + (s.completedRenewals ?? 0),
        }));
      }
      if (activityRes.status === 'fulfilled') {
        setActivities(activityRes.value.data.rows || activityRes.value.data || []);
      }
      if (pipelineRes.status === 'fulfilled') {
        const pipeline = pipelineRes.value.data;
        setRenewalPipeline(Array.isArray(pipeline) ? pipeline.slice(0, 5) : (pipeline.renewals || pipeline.data || []).slice(0, 5));
      }
      if (healthRes.status === 'fulfilled') {
        setHealthScore(healthRes.value.data);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => fetchData();

    socket.on('policy_created', handleUpdate);
    socket.on('policy_updated', handleUpdate);
    socket.on('policy_deleted', handleUpdate);
    socket.on('renewal_updated', handleUpdate);

    return () => {
      socket.off('policy_created', handleUpdate);
      socket.off('policy_updated', handleUpdate);
      socket.off('policy_deleted', handleUpdate);
      socket.off('renewal_updated', handleUpdate);
    };
  }, [socket, fetchData]);

  // -----------------------------------------------------------------------
  // Derived data
  // -----------------------------------------------------------------------

  const coverageRatio = useMemo(() => {
    if (!stats.totalPolicies) return 0;
    const active = Math.max(0, stats.totalPolicies - stats.overduePolicies);
    return Math.round((active / stats.totalPolicies) * 100);
  }, [stats.totalPolicies, stats.overduePolicies]);

  const completedRenewals = stats.completedRenewals || (healthScore?.completed_renewals ?? 0);
  const totalRenewals = stats.totalRenewals || (healthScore?.total_renewals ?? Math.max(stats.upcomingRenewals + completedRenewals, 1));

  const chartData = useMemo(() => ({
    labels: ['Upcoming Renewals', 'Overdue', 'Active'],
    datasets: [{
      label: '# of Policies',
      data: [
        stats.upcomingRenewals,
        stats.overduePolicies,
        Math.max(0, stats.totalPolicies - stats.upcomingRenewals - stats.overduePolicies),
      ],
      backgroundColor: [
        'rgba(251, 191, 36, 0.6)',
        'rgba(239, 68, 68, 0.6)',
        'rgba(16, 185, 129, 0.6)',
      ],
      borderColor: [
        'rgba(251, 191, 36, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(16, 185, 129, 1)',
      ],
      borderWidth: 1,
      hoverOffset: 6,
    }],
  }), [stats]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: { family: "'JetBrains Mono', 'Courier New', monospace", size: 10 },
          boxWidth: 8,
          padding: 15,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
        bodyFont: { family: "'JetBrains Mono', monospace", size: 10 },
        padding: 12,
        cornerRadius: 8,
      }
    },
    cutout: '72%',
  }), []);

  // Quick nav definitions
  const quickNavCards = [
    { to: '/policies', icon: HiDocumentText, title: 'Policies', description: 'Manage active coverage & policy lifecycle', color: 'blue' },
    { to: '/renewals', icon: ArrowPathIcon, title: 'Renewals', description: 'Track renewal pipeline & deadlines', color: 'amber' },
    { to: '/customers', icon: HiUsers, title: 'Customers', description: 'Customer profiles & engagement', color: 'emerald' },
    { to: '/analytics', icon: HiChartBar, title: 'Analytics', description: 'Performance metrics & trend analysis', color: 'purple' },
    { to: '/ai-command', icon: HiBolt, title: 'AI Command', description: 'Intelligent analysis & predictions', color: 'cyan' },
  ];

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      className="space-y-6 h-full flex flex-col pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ================================================================= */}
      {/*  HEADER                                                           */}
      {/* ================================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-[10px] font-mono tracking-widest">v2.4.0-STABLE</div>
            <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-[10px] font-mono tracking-widest">DB: SERVICENOW</div>
            <div className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded text-purple-400 text-[10px] font-mono tracking-widest">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })} UTC
            </div>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">STRATEGIC COMMAND</h2>
          <div className="flex items-center space-x-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">
              RENEWAL ENGINE STATUS: OPTIMAL // AI MONITORING: ACTIVE // HEALTH: {healthScore?.score ?? coverageRatio}%
            </p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-white/10 text-white shadow-lg border border-white/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <SignalIcon className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded transition-all flex items-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-blue-500/20 text-blue-400 shadow-lg border border-blue-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <BeakerIcon className="w-4 h-4" />
            AI Insights
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/*  TAB CONTENT                                                      */}
      {/* ================================================================= */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* -------------------------------------------------------------- */}
            {/*  1. PRIMARY STATS ROW                                          */}
            {/* -------------------------------------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Coverage */}
              <motion.div variants={itemVariants} className="glass-card p-6 tech-border relative group overflow-hidden grid-pattern">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ClipboardDocumentCheckIcon className="w-24 h-24" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-1">Total Coverage</p>
                    <h3 className="text-4xl font-black text-white font-mono">
                      <AnimatedCounter target={stats.totalPolicies} />
                    </h3>
                  </div>
                  <div className="p-2 bg-white/5 border border-white/10 rounded text-slate-400 group-hover:text-white transition-colors">
                    <ClipboardDocumentCheckIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-6 flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-[10px] text-white font-mono">100%</span>
                </div>
              </motion.div>

              {/* Renewal Targets */}
              <motion.div variants={itemVariants} className="glass-card p-6 tech-border relative group overflow-hidden border-l-amber-500/30 border-l-2 grid-pattern">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ArrowPathIcon className="w-24 h-24" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-1">Renewal Targets</p>
                    <h3 className="text-4xl font-black text-white font-mono">
                      <AnimatedCounter target={stats.upcomingRenewals} />
                    </h3>
                  </div>
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-500 group-hover:text-amber-400 transition-colors">
                    <ArrowPathIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-6 flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.totalPolicies > 0 ? (stats.upcomingRenewals / stats.totalPolicies) * 100 : 0}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                  <span className="text-[10px] text-amber-500 font-mono">
                    {stats.totalPolicies > 0 ? ((stats.upcomingRenewals / stats.totalPolicies) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </motion.div>

              {/* Critical Lapses */}
              <motion.div variants={itemVariants} className="glass-card p-6 tech-border relative group overflow-hidden border-l-red-500/30 border-l-2 grid-pattern">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ExclamationTriangleIcon className="w-24 h-24" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-1">Critical Lapses</p>
                    <h3 className="text-4xl font-black text-white font-mono">
                      <AnimatedCounter target={stats.overduePolicies} />
                    </h3>
                  </div>
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-red-500 group-hover:text-red-400 transition-colors">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-6 flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.totalPolicies > 0 ? (stats.overduePolicies / stats.totalPolicies) * 100 : 0}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
                    />
                  </div>
                  <span className="text-[10px] text-red-500 font-mono">
                    {stats.totalPolicies > 0 ? ((stats.overduePolicies / stats.totalPolicies) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </motion.div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/*  2. RENEWAL COUNTDOWN + REVENUE OVERVIEW                       */}
            {/* -------------------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Renewal Countdown — spans 3 cols */}
              <motion.div variants={itemVariants} className="lg:col-span-3 glass-card tech-border p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <HiClock className="w-5 h-5 text-amber-400" />
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest font-mono">Renewal Countdown</h3>
                  </div>
                  <Link
                    to="/renewals"
                    className="text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    View All <HiArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {renewalPipeline.length > 0 ? (
                  <div className="space-y-2.5">
                    {renewalPipeline.map((renewal, i) => (
                      <RenewalCountdownItem key={renewal.id || i} renewal={renewal} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <HiCalendarDays className="w-10 h-10 text-slate-700 mb-3" />
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">No upcoming renewals in pipeline</p>
                    <p className="text-slate-600 font-mono text-[10px] mt-1">Pipeline data syncs in real-time</p>
                  </div>
                )}
              </motion.div>

              {/* Revenue Overview — spans 2 cols */}
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
                {/* Total Premium Revenue */}
                <div className="glass-card tech-border p-5 relative group overflow-hidden">
                  <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <HiCurrencyDollar className="w-20 h-20" />
                  </div>
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest mb-1">Total Premium Revenue</p>
                      <h3 className="text-2xl font-black text-emerald-400 font-mono">
                        <AnimatedCounter target={stats.totalPremium} format="currency" prefix="₹" decimals={0} />
                      </h3>
                    </div>
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400">
                      <HiCurrencyDollar className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <HiArrowTrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-mono text-emerald-500">LIVE AGGREGATE</span>
                  </div>
                </div>

                {/* Average Premium */}
                <div className="glass-card tech-border p-5 relative group overflow-hidden">
                  <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <HiChartBar className="w-20 h-20" />
                  </div>
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest mb-1">Average Premium</p>
                      <h3 className="text-2xl font-black text-blue-400 font-mono">
                        <AnimatedCounter target={stats.averagePremium} format="currency" prefix="₹" decimals={0} />
                      </h3>
                    </div>
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400">
                      <HiChartBar className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono text-blue-500">PER POLICY AVG</span>
                  </div>
                </div>

                {/* Coverage Ratio */}
                <div className="glass-card tech-border p-5 relative group overflow-hidden">
                  <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <HiShieldCheck className="w-20 h-20" />
                  </div>
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest mb-1">Coverage Ratio</p>
                      <h3 className="text-2xl font-black text-white font-mono">
                        <AnimatedCounter target={coverageRatio} suffix="%" />
                      </h3>
                    </div>
                    <div className={`p-2 rounded border ${coverageRatio >= 80 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : coverageRatio >= 60 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      <HiShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${coverageRatio >= 80 ? 'bg-emerald-500 shadow-[0_0_8px] shadow-emerald-500/40' : coverageRatio >= 60 ? 'bg-amber-500 shadow-[0_0_8px] shadow-amber-500/40' : 'bg-red-500 shadow-[0_0_8px] shadow-red-500/40'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${coverageRatio}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.6 }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/*  3. RENEWAL HEALTH BAR                                         */}
            {/* -------------------------------------------------------------- */}
            <RenewalHealthBar completed={completedRenewals} total={totalRenewals} />

            {/* -------------------------------------------------------------- */}
            {/*  4. TELEMETRY + DOUGHNUT CHART                                 */}
            {/* -------------------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6 tech-border flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <CommandLineIcon className="w-5 h-5 text-blue-400" />
                    <span className="font-mono text-sm uppercase tracking-widest">Live Telemetry Stream</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">FEED</span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-red-500' : i === 2 ? 'bg-amber-500' : 'bg-green-500'} animate-pulse`}
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-black/40 rounded-lg border border-white/5 p-1">
                  <TelemetryStream />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-card p-6 tech-border flex flex-col min-h-[400px]">
                <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                  <SignalIcon className="w-5 h-5 text-purple-400" />
                  <span className="font-mono text-sm uppercase tracking-widest">Portfolio Distribution</span>
                </h3>
                <div className="flex-1 relative">
                  <Doughnut data={chartData} options={chartOptions} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-4">
                    <span className="text-2xl font-black text-white font-mono">{stats.totalPolicies}</span>
                    <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">TOTAL POLICIES</span>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">SYNC FREQUENCY:</span>
                    <span className="text-blue-400">REAL-TIME</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">INTEGRITY CHECK:</span>
                    <span className="text-green-400">PASSED</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">LAST REFRESH:</span>
                    <span className="text-slate-300">{currentTime.toLocaleTimeString('en-US', { hour12: false })}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/*  5. QUICK NAVIGATION CARDS                                     */}
            {/* -------------------------------------------------------------- */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-4">
                <HiBolt className="w-4 h-4 text-blue-400" />
                <h3 className="text-white font-bold font-mono text-sm uppercase tracking-widest">Quick Navigation</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {quickNavCards.map((card) => (
                  <QuickNavCard key={card.to} {...card} />
                ))}
              </div>
            </motion.div>

            {/* -------------------------------------------------------------- */}
            {/*  6. RECENT ACTIVITY                                            */}
            {/* -------------------------------------------------------------- */}
            <motion.div variants={itemVariants} className="glass-card p-6 tech-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <CommandLineIcon className="w-5 h-5 text-slate-400" />
                  <span className="font-mono text-sm uppercase tracking-widest">Recent System Activity</span>
                </h3>
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                  {activities.length} EVENTS
                </span>
              </div>
              <div className="space-y-1 overflow-hidden">
                {activities.map((act, i) => (
                  <motion.div
                    key={act.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between p-3 rounded-lg border-b border-white/5 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${act.action === 'CREATE' ? 'bg-emerald-500' : act.action === 'UPDATE' ? 'bg-blue-500' : 'bg-red-500'}`} />
                      <div className="min-w-0">
                        <p className="text-xs text-white font-bold group-hover:text-blue-400 transition-colors uppercase tracking-tight truncate">
                          {act.description}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono uppercase">
                          {act.User?.name || 'SYSTEM'} &bull; {new Date(act.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                      act.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-400' :
                      act.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {act.action}
                    </div>
                  </motion.div>
                ))}
                {activities.length === 0 && (
                  <div className="text-center p-10 text-slate-600 font-mono text-xs uppercase tracking-widest">
                    <CommandLineIcon className="w-8 h-8 mx-auto mb-3 text-slate-700" />
                    NO RECENT ACTIVITY DETECTED
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <React.Suspense fallback={<DashboardSkeleton />}>
              <AIInsights />
            </React.Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/*  QUICK ACTIONS FAB                                                */}
      {/* ================================================================= */}
      <div className="fixed bottom-8 right-8 z-40">
        <AnimatePresence>
          {quickActionsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-16 right-0 mb-2 space-y-2 min-w-[200px]"
            >
              {[
                { label: 'New Policy', icon: HiPlus, onClick: () => navigate('/policies/new'), color: 'bg-blue-600 hover:bg-blue-500' },
                { label: 'AI Analysis', icon: HiSparkles, onClick: () => navigate('/ai-command'), color: 'bg-purple-600 hover:bg-purple-500' },
                { label: 'Renewals', icon: ArrowPathIcon, onClick: () => navigate('/renewals'), color: 'bg-amber-600 hover:bg-amber-500' },
                { label: 'Export Data', icon: HiArrowDownTray, onClick: () => {}, color: 'bg-slate-600 hover:bg-slate-500' },
              ].map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { action.onClick(); setQuickActionsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 ${action.color} text-white rounded-lg font-mono text-xs uppercase tracking-wider shadow-lg transition-all click-scale`}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={() => setQuickActionsOpen(!quickActionsOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
            quickActionsOpen
              ? 'bg-slate-700 hover:bg-slate-600 rotate-45'
              : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/30 shadow-blue-500/20'
          }`}
        >
          <HiPlus className="w-6 h-6 text-white transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Dashboard;
