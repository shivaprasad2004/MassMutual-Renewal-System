import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  HiPlus as FaPlus, 
  HiPencil as FaEdit, 
  HiTrash as FaTrash, 
  HiMagnifyingGlass as FaSearch, 
  HiArrowPath as FaSpinner,
  HiFunnel as FunnelIcon,
  HiChevronUpDown as SortIcon,
  HiShieldExclamation as RiskIcon,
  HiCheckCircle as CheckCircleIcon,
  HiClock as ClockIcon
} from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'renewal_date', direction: 'asc' });
  const { socket } = useSocket();

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Real-time listeners
  useEffect(() => {
    if (socket) {
        socket.on('policy_created', (newPolicy) => {
            setPolicies(prev => [...prev, newPolicy]);
        });

        socket.on('policy_updated', (updatedPolicy) => {
            setPolicies(prev => prev.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
        });

        socket.on('policy_deleted', (id) => {
            setPolicies(prev => prev.filter(p => p.id !== parseInt(id)));
        });

        return () => {
            socket.off('policy_created');
            socket.off('policy_updated');
            socket.off('policy_deleted');
        };
    }
  }, [socket]);

  const fetchPolicies = async () => {
    try {
      const res = await api.get('/policies');
      setPolicies(res.data.policies || res.data); // Support both paginated and flat response
      setLoading(false);
    } catch (error) {
      console.error('Error fetching policies:', error);
      setLoading(false);
    }
  };

  const deletePolicy = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    try {
      await api.delete(`/policies/${id}`);
      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredPolicies = policies
    .filter(policy => {
      const matchesSearch = 
        policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (policy.Customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || policy.status === statusFilter;
      const matchesType = typeFilter === 'All' || policy.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortConfig.key === 'risk_score') {
        const aScore = a.risk_score || 0;
        const bScore = b.risk_score || 0;
        return sortConfig.direction === 'asc' ? aScore - bScore : bScore - aScore;
      }
      
      let aVal = a[sortConfig.key] || '';
      let bVal = b[sortConfig.key] || '';
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const uniqueTypes = ['All', ...new Set(policies.map(p => p.type))];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full space-y-4">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">Scanning Policy Database...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-20"
    >
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/10 pb-6">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">POLICIES</h1>
           <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
             <CheckCircleIcon className="w-4 h-4 text-green-500" />
             Synchronized with ServiceNow Core
           </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="SEARCH POLICY_ID OR CUSTOMER..."
              className="bg-white/5 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded font-mono text-xs focus:outline-none focus:border-blue-500/50 w-full placeholder-slate-600 transition-all focus:ring-1 focus:ring-blue-500/20 uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-white/5 p-1 rounded border border-white/10">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-400 text-[10px] font-mono uppercase px-3 py-1.5 focus:outline-none cursor-pointer hover:text-white transition-colors border-r border-white/10"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending Renewal">Pending</option>
              <option value="Lapsed">Lapsed</option>
              <option value="Renewed">Renewed</option>
            </select>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-slate-400 text-[10px] font-mono uppercase px-3 py-1.5 focus:outline-none cursor-pointer hover:text-white transition-colors"
            >
              {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <Link
            to="/policies/new"
            className="bg-blue-600 text-white px-5 py-2.5 rounded font-mono text-xs uppercase tracking-widest flex items-center hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95 border border-blue-400/20"
          >
            <FaPlus className="mr-2" /> Add Policy
          </Link>
        </div>
      </div>

      {/* Advanced Table */}
      <div className="glass-card tech-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-white/5">
              <tr>
                <th onClick={() => handleSort('policy_number')} className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors group">
                  <div className="flex items-center gap-1">
                    Policy ID <SortIcon className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </div>
                </th>
                <th onClick={() => handleSort('Customer')} className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors group">
                  <div className="flex items-center gap-1">
                    Customer <SortIcon className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Type</th>
                <th onClick={() => handleSort('renewal_date')} className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors group">
                  <div className="flex items-center gap-1">
                    Renewal <SortIcon className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </div>
                </th>
                <th onClick={() => handleSort('risk_score')} className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors group">
                  <div className="flex items-center gap-1">
                    AI Risk <RiskIcon className="w-3 h-3 text-blue-400" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-mono text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/20">
              <AnimatePresence mode="popLayout">
                {filteredPolicies.map((policy, index) => (
                  <motion.tr 
                    key={policy.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-white/5 transition-colors group border-l-2 border-transparent hover:border-blue-500/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-xs text-white font-bold group-hover:text-blue-400 transition-colors font-mono">{policy.policy_number}</div>
                       <div className="text-[8px] text-slate-600 font-mono uppercase mt-0.5 tracking-tighter italic">SYNCED: SERVICENOW_DB</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-xs text-slate-200 uppercase font-bold tracking-tight">{policy.Customer?.name || 'N/A'}</div>
                       <div className="text-[9px] text-slate-500 font-mono mt-0.5">{policy.Customer?.email || 'NO_CONTACT_INFO'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-slate-400 uppercase font-mono inline-block">
                         {policy.type}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                         <ClockIcon className="w-3.5 h-3.5 text-slate-600" />
                         {policy.renewal_date}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${policy.risk_score || 0}%` }}
                               className={`h-full ${
                                 (policy.risk_score || 0) >= 75 ? 'bg-red-500' : 
                                 (policy.risk_score || 0) >= 40 ? 'bg-amber-500' : 'bg-green-500'
                               }`}
                             />
                          </div>
                          <span className={`text-[10px] font-mono font-bold ${
                             (policy.risk_score || 0) >= 75 ? 'text-red-400' : 
                             (policy.risk_score || 0) >= 40 ? 'text-amber-400' : 'text-green-400'
                          }`}>
                            {policy.risk_score || 0}%
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-[9px] font-black rounded border uppercase tracking-widest ${
                        policy.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        policy.status === 'Lapsed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        policy.status === 'Renewed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/policies/edit/${policy.id}`}
                          className="text-slate-400 hover:text-blue-400 transition-colors p-1.5 hover:bg-blue-500/10 rounded"
                        >
                          <FaEdit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => deletePolicy(policy.id)} 
                          className="text-slate-400 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredPolicies.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                       <FaSearch className="text-4xl" />
                       <p className="font-mono text-xs uppercase tracking-[0.3em]">NO MATCHING RECORDS FOUND IN THE ARCHIVE</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Policies;
