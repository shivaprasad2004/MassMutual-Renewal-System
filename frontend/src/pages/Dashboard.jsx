import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
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
import { FaClipboardList, FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/policies/stats', {
          headers: { 'x-auth-token': token }
        });
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const data = {
    labels: ['Upcoming Renewals', 'Overdue', 'Active'],
    datasets: [
      {
        label: '# of Policies',
        data: [stats.upcomingRenewals, stats.overduePolicies, stats.totalPolicies - stats.upcomingRenewals - stats.overduePolicies],
        backgroundColor: [
          '#f59e0b', // Amber 500
          '#ef4444', // Red 500
          '#3b82f6', // Blue 500
        ],
        borderColor: [
          '#1e293b',
          '#1e293b',
          '#1e293b',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8' // Slate 400
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-massmutual-text-muted mt-1">Welcome back, here's what's happening today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Policies Card */}
        <div className="bg-massmutual-card p-6 rounded-xl border border-massmutual-border hover:border-blue-500/50 transition-all shadow-glow hover:shadow-glow-strong relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaClipboardList className="text-6xl text-blue-500" />
          </div>
          <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Total Policies</h3>
          <p className="text-4xl font-bold text-white mt-2">{stats.totalPolicies}</p>
          <div className="mt-4 flex items-center text-sm text-green-400">
            <FaCheckCircle className="mr-1" /> Active Tracking
          </div>
        </div>

        {/* Upcoming Renewals Card */}
        <div className="bg-massmutual-card p-6 rounded-xl border border-massmutual-border hover:border-amber-500/50 transition-all shadow-none hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaExclamationTriangle className="text-6xl text-amber-500" />
          </div>
          <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Upcoming Renewals</h3>
          <p className="text-4xl font-bold text-white mt-2">{stats.upcomingRenewals}</p>
          <div className="mt-4 text-sm text-amber-400">
            Within next 30 days
          </div>
        </div>

        {/* Overdue Policies Card */}
        <div className="bg-massmutual-card p-6 rounded-xl border border-massmutual-border hover:border-red-500/50 transition-all shadow-none hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaExclamationTriangle className="text-6xl text-red-500" />
          </div>
          <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Overdue Policies</h3>
          <p className="text-4xl font-bold text-white mt-2">{stats.overduePolicies}</p>
          <div className="mt-4 text-sm text-red-400 font-medium">
            Action Required
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-massmutual-card p-6 rounded-xl border border-massmutual-border">
          <h3 className="text-xl font-bold text-white mb-6 border-b border-massmutual-border pb-4">Policy Status Distribution</h3>
          <div className="h-64 flex justify-center">
            <Doughnut data={data} options={options} />
          </div>
        </div>

        <div className="bg-massmutual-card p-6 rounded-xl border border-massmutual-border">
           <h3 className="text-xl font-bold text-white mb-6 border-b border-massmutual-border pb-4">Recent Activity</h3>
           <div className="space-y-4">
             {/* Placeholder for activity log */}
             <div className="flex items-start space-x-3 p-3 hover:bg-zinc-900 rounded-lg transition-colors border border-transparent hover:border-massmutual-border">
                <div className="bg-blue-500/10 p-2 rounded-full text-blue-400">
                  <FaClipboardList />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">New Policy Added</p>
                  <p className="text-xs text-zinc-500">Policy #POL-2024-001 created for John Doe</p>
                  <p className="text-xs text-zinc-600 mt-1">2 hours ago</p>
                </div>
             </div>
             <div className="flex items-start space-x-3 p-3 hover:bg-zinc-900 rounded-lg transition-colors border border-transparent hover:border-massmutual-border">
                <div className="bg-amber-500/10 p-2 rounded-full text-amber-400">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Renewal Alert Sent</p>
                  <p className="text-xs text-zinc-500">Reminder sent to Jane Smith (30 days left)</p>
                  <p className="text-xs text-zinc-600 mt-1">5 hours ago</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
