import React, { useEffect, useState } from 'react';
import api from '../services/api'; 
import { useSocket } from '../context/SocketContext';
import { Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import TelemetryStream from '../components/TelemetryStream';
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
  HiSignal as SignalIcon
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
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchStats = async () => {
    try {
      const res = await api.get('/policies/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        fetchStats();
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

  const data = {
    labels: ['Upcoming Renewals', 'Overdue', 'Active'],
    datasets: [
      {
        label: '# of Policies',
        data: [stats.upcomingRenewals, stats.overduePolicies, stats.totalPolicies - stats.upcomingRenewals - stats.overduePolicies],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)', // Amber (Gold)
          'rgba(239, 68, 68, 0.8)',  // Red
          'rgba(255, 255, 255, 0.8)', // White/Silver
        ],
        borderColor: [
          '#fbbf24',
          '#ef4444',
          '#ffffff',
        ],
        borderWidth: 1,
        hoverOffset: 4
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: {
            family: "'JetBrains Mono', 'Courier New', monospace",
            size: 11
          },
          boxWidth: 10,
          padding: 20
        }
      }
    },
    cutout: '75%',
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
          <p className="text-white font-mono text-sm animate-pulse">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 h-full flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tighter">MISSION CONTROL</h2>
          <div className="flex items-center space-x-2 mt-1">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <p className="text-slate-400 font-mono text-xs tracking-widest">SYSTEM OPTIMAL // RENEWAL ENGINE ACTIVE</p>
          </div>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-slate-500 font-mono text-xs">LAT: 42.3601° N | LONG: 71.0589° W</p>
           <p className="text-slate-500 font-mono text-xs">ENCRYPTION: AES-256-GCM</p>
        </div>
      </div>

      {/* Top Stats Row - Tech Card Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="glass-card p-6 tech-border relative group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-mono text-xs uppercase tracking-wider mb-1">Total Coverage</p>
              <h3 className="text-3xl font-bold text-white font-mono">{stats.totalPolicies}</h3>
            </div>
            <div className="p-2 bg-white/10 border border-white/30 rounded text-white">
              <ClipboardDocumentCheckIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <div className="flex-1 h-1 bg-slate-800">
              <motion.div 
                className="h-full bg-white" 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <span className="text-[10px] text-white font-mono">100%</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 tech-border relative group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-mono text-xs uppercase tracking-wider mb-1">Renewal Targets</p>
              <h3 className="text-3xl font-bold text-white font-mono">{stats.upcomingRenewals}</h3>
            </div>
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400">
              <ArrowPathIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <div className="flex-1 h-1 bg-slate-800">
              <motion.div 
                className="h-full bg-amber-500" 
                initial={{ width: 0 }}
                animate={{ width: `${(stats.upcomingRenewals / (stats.totalPolicies || 1)) * 100}%` }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>
            <span className="text-[10px] text-amber-400 font-mono">ACTION REQ</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 tech-border relative group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-mono text-xs uppercase tracking-wider mb-1">Critical Risk</p>
              <h3 className="text-3xl font-bold text-white font-mono">{stats.overduePolicies}</h3>
            </div>
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400">
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <div className="flex-1 h-1 bg-slate-800">
              <motion.div 
                className="h-full bg-red-500" 
                initial={{ width: 0 }}
                animate={{ width: `${(stats.overduePolicies / (stats.totalPolicies || 1)) * 100}%` }}
                transition={{ duration: 1, delay: 0.7 }}
              />
            </div>
            <span className="text-[10px] text-red-400 font-mono">ALERT</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Center/Left: Visual Analysis */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6 tech-border flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-2">
            <h3 className="text-lg font-bold text-white flex items-center">
              <SignalIcon className="w-5 h-5 mr-2 text-white" />
              PORTFOLIO DISTRIBUTION
            </h3>
            <div className="flex space-x-4 text-xs font-mono text-slate-500">
              <span>SCAN_MODE: PASSIVE</span>
              <span>REFRESH: AUTO</span>
            </div>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center">
            {/* Background Grid Lines for Effect */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none opacity-10">
              {[...Array(36)].map((_, i) => (
                <div key={i} className="border border-white/30"></div>
              ))}
            </div>
            
            <div className="w-full max-w-md h-64 relative z-10">
               <Doughnut data={data} options={options} />
               {/* Center Stat */}
               <div className="absolute top-1/2 left-[30%] transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                 <div className="text-4xl font-bold text-white font-mono">{stats.totalPolicies}</div>
                 <div className="text-[10px] text-slate-400 uppercase tracking-widest">Active Units</div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Telemetry Stream */}
        <motion.div variants={itemVariants} className="lg:col-span-1 h-[400px] lg:h-auto">
          <TelemetryStream />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
