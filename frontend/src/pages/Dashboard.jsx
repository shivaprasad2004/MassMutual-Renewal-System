import React, { useEffect, useState } from 'react';
import api from '../services/api'; 
import { useSocket } from '../context/SocketContext';
import { Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import TelemetryStream from '../components/TelemetryStream';
import AIInsights from '../components/AIInsights';
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
  HiCommandLine as CommandLineIcon
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

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPolicies: 0,
    upcomingRenewals: 0,
    overduePolicies: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { socket } = useSocket();

  const fetchData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/policies/stats'),
        api.get('/auth/activities?limit=10')
      ]);
      setStats(statsRes.data);
      setActivities(activityRes.data.rows || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        fetchData();
      };

      socket.on('policy_created', handleUpdate);
      socket.on('policy_updated', handleUpdate);
      socket.on('policy_deleted', handleUpdate);

      return () => {
        socket.off('policy_created', handleUpdate);
        socket.off('policy_updated', handleUpdate);
        socket.off('policy_deleted', handleUpdate);
      };
    }
  }, [socket]);

  const chartData = {
    labels: ['Upcoming Renewals', 'Overdue', 'Active'],
    datasets: [
      {
        label: '# of Policies',
        data: [stats.upcomingRenewals, stats.overduePolicies, Math.max(0, stats.totalPolicies - stats.upcomingRenewals - stats.overduePolicies)],
        backgroundColor: [
          'rgba(251, 191, 36, 0.6)', // Amber (Gold)
          'rgba(239, 68, 68, 0.6)',  // Red
          'rgba(59, 130, 246, 0.6)', // Blue
        ],
        borderColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 1,
        hoverOffset: 4
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: {
            family: "'JetBrains Mono', 'Courier New', monospace",
            size: 10
          },
          boxWidth: 8,
          padding: 15
        }
      }
    },
    cutout: '70%',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          <p className="text-white font-mono text-sm animate-pulse uppercase tracking-[0.2em]">INITIALIZING SYSTEM CORE...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 h-full flex flex-col pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-[10px] font-mono tracking-widest">v2.4.0-STABLE</div>
             <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-[10px] font-mono tracking-widest">DB: SERVICENOW</div>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">STRATEGIC COMMAND</h2>
          <div className="flex items-center space-x-2 mt-1">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">RENEWAL ENGINE STATUS: OPTIMAL // AI MONITORING: ACTIVE</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 backdrop-blur-xl">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-white/10 text-white shadow-lg border border-white/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <SignalIcon className="w-4 h-4" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded transition-all flex items-center gap-2 ${activeTab === 'ai' ? 'bg-blue-500/20 text-blue-400 shadow-lg border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <BeakerIcon className="w-4 h-4" />
            AI Insights
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} className="glass-card p-6 tech-border relative group overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ClipboardDocumentCheckIcon className="w-24 h-24" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-slate-400 font-mono text-xs uppercase tracking-wider mb-1">Total Coverage</p>
                    <h3 className="text-4xl font-black text-white font-mono">{stats.totalPolicies}</h3>
                  </div>
                  <div className="p-2 bg-white/5 border border-white/10 rounded text-slate-400 group-hover:text-white transition-colors">
                    <ClipboardDocumentCheckIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-6 flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-slate-800">
                    <motion.div 
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[10px] text-white font-mono">100%</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-card p-6 tech-border relative group overflow-hidden border-l-amber-500/30 border-l-2">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ArrowPathIcon className="w-24 h-24" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-slate-400 font-mono text-xs uppercase tracking-wider mb-1">Renewal Targets</p>
                    <h3 className="text-4xl font-black text-white font-mono">{stats.upcomingRenewals}</h3>
                  </div>
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-500 group-hover:text-amber-400 transition-colors">
                    <ArrowPathIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-6 flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-slate-800">
                    <motion.div 
                      className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.upcomingRenewals / stats.totalPolicies) * 100}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                  <span className="text-[10px] text-amber-500 font-mono">{stats.totalPolicies > 0 ? ((stats.upcomingRenewals / stats.totalPolicies) * 100).toFixed(0) : 0}%</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-card p-6 tech-border relative group overflow-hidden border-l-red-500/30 border-l-2">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ExclamationTriangleIcon className="w-24 h-24" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-slate-400 font-mono text-xs uppercase tracking-wider mb-1">Critical Lapses</p>
                    <h3 className="text-4xl font-black text-white font-mono">{stats.overduePolicies}</h3>
                  </div>
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-red-500 group-hover:text-red-400 transition-colors">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-6 flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-slate-800">
                    <motion.div 
                      className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.overduePolicies / stats.totalPolicies) * 100}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                    />
                  </div>
                  <span className="text-[10px] text-red-500 font-mono">{stats.totalPolicies > 0 ? ((stats.overduePolicies / stats.totalPolicies) * 100).toFixed(0) : 0}%</span>
                </div>
              </motion.div>
            </div>

            {/* Middle Row - Charts and Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6 tech-border flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <CommandLineIcon className="w-5 h-5 text-blue-400" />
                    LIVE TELEMETRY STREAM
                  </h3>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-red-500' : i === 2 ? 'bg-amber-500' : 'bg-green-500'} animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
                <div className="flex-1 bg-black/40 rounded border border-white/5 p-1">
                   <TelemetryStream />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-card p-6 tech-border flex flex-col min-h-[400px]">
                <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                   <SignalIcon className="w-5 h-5 text-purple-400" />
                   PORTFOLIO DISTRIBUTION
                </h3>
                <div className="flex-1 relative">
                  <Doughnut data={chartData} options={chartOptions} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-4">
                     <span className="text-2xl font-black text-white">{stats.totalPolicies}</span>
                     <span className="text-[8px] text-slate-500 font-mono uppercase tracking-tighter">TOTAL POLICIES</span>
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
                </div>
              </motion.div>
            </div>

            {/* Recent Activity Section */}
            <motion.div variants={itemVariants} className="glass-card p-6 tech-border">
               <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                  <HiCommandLine className="w-5 h-5 text-slate-400" />
                  RECENT SYSTEM ACTIVITY
               </h3>
               <div className="space-y-3 overflow-hidden">
                  {activities.map((act, i) => (
                    <motion.div 
                      key={act.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${act.action === 'CREATE' ? 'bg-green-500' : act.action === 'UPDATE' ? 'bg-blue-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="text-xs text-white font-bold group-hover:text-blue-400 transition-colors uppercase tracking-tight">{act.description}</p>
                          <p className="text-[10px] text-slate-500 font-mono uppercase">{act.User?.name} • {new Date(act.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-slate-600 group-hover:text-slate-400">
                        {act.action}
                      </div>
                    </motion.div>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-center p-8 text-slate-600 font-mono text-xs uppercase tracking-widest">
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
            <AIInsights />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
