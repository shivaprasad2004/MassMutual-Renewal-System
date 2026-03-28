import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  HiClock as ClockIcon,
  HiDocumentText as DocumentIcon,
  HiShieldCheck as ShieldCheckIcon,
  HiExclamationTriangle as AlertIcon,
  HiBanknotes as BanknotesIcon,
  HiArrowDownTray as DownloadIcon,
  HiChevronLeft as ChevronLeftIcon,
  HiChevronRight as ChevronRightIcon
} from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'renewal_date', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exporting, setExporting] = useState(false);
  const { socket } = useSocket();
  const navigate = useNavigate();

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
      setPolicies(res.data.policies || res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching policies:', error);
      setLoading(false);
    }
  };

  const deletePolicy = async (id, e) => {
    e.stopPropagation();
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

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get('/policies/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `policies_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting policies:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleRowClick = (policyId) => {
    navigate(`/policies/${policyId}`);
  };

  const filteredPolicies = useMemo(() => {
    return policies
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

        if (sortConfig.key === 'premium_amount') {
          const aVal = parseFloat(a.premium_amount) || 0;
          const bVal = parseFloat(b.premium_amount) || 0;
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [policies, searchTerm, statusFilter, typeFilter, sortConfig]);

  // Summary stats computed from full policy list
  const stats = useMemo(() => {
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(p => p.status === 'Active').length;
    const atRisk = policies.filter(p => (p.risk_score || 0) >= 60).length;
    const totalPremium = policies.reduce((sum, p) => sum + (parseFloat(p.premium_amount) || 0), 0);
    const avgPremium = totalPolicies > 0 ? totalPremium / totalPolicies : 0;
    return { totalPolicies, activePolicies, atRisk, avgPremium };
  }, [policies]);

  // Pagination
  const totalResults = filteredPolicies.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  const paginatedPolicies = filteredPolicies.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, pageSize]);

  const uniqueTypes = ['All', ...new Set(policies.map(p => p.type))];

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full space-y-4">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">Scanning Policy Database...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Policies',
      value: stats.totalPolicies,
      icon: DocumentIcon,
      color: 'blue',
      borderColor: 'border-l-blue-500',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      format: 'number',
    },
    {
      label: 'Active Policies',
      value: stats.activePolicies,
      icon: ShieldCheckIcon,
      color: 'emerald',
      borderColor: 'border-l-emerald-500',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      format: 'number',
    },
    {
      label: 'At Risk',
      value: stats.atRisk,
      icon: AlertIcon,
      color: 'amber',
      borderColor: 'border-l-amber-500',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      format: 'number',
    },
    {
      label: 'Avg Premium',
      value: stats.avgPremium,
      icon: BanknotesIcon,
      color: 'blue',
      borderColor: 'border-l-blue-500',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      format: 'currency',
      prefix: '$',
      decimals: 0,
    },
  ];

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

          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-white/5 border border-white/10 text-slate-400 px-4 py-2.5 rounded font-mono text-xs uppercase tracking-widest flex items-center hover:bg-white/10 hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <FaSpinner className="mr-2 w-4 h-4 animate-spin" />
            ) : (
              <DownloadIcon className="mr-2 w-4 h-4" />
            )}
            Export
          </button>

          <Link
            to="/policies/new"
            className="bg-blue-600 text-white px-5 py-2.5 rounded font-mono text-xs uppercase tracking-widest flex items-center hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95 border border-blue-400/20"
          >
            <FaPlus className="mr-2" /> Add Policy
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`glass-card tech-border border-l-4 ${card.borderColor} p-5 hover-lift`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{card.label}</p>
                <p className="text-2xl font-black text-white font-mono tracking-tight">
                  {card.format === 'currency' ? (
                    <AnimatedCounter
                      target={card.value}
                      format="currency"
                      prefix="$"
                      decimals={0}
                      duration={1200}
                    />
                  ) : (
                    <AnimatedCounter
                      target={card.value}
                      format="number"
                      duration={1200}
                    />
                  )}
                </p>
              </div>
              <div className={`p-2.5 rounded-lg ${card.iconBg}`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">
          <span className="text-slate-300 font-bold">{filteredPolicies.length}</span> records found
        </p>
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
                <th onClick={() => handleSort('premium_amount')} className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors group">
                  <div className="flex items-center gap-1">
                    Premium <SortIcon className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </div>
                </th>
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
                {paginatedPolicies.map((policy, index) => (
                  <motion.tr
                    key={policy.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleRowClick(policy.id)}
                    className="hover:bg-white/5 transition-colors group border-l-2 border-transparent hover:border-blue-500/50 cursor-pointer"
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
                       <div className="text-xs text-slate-200 font-mono font-bold">
                         {formatCurrency(policy.premium_amount)}
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
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-blue-400 transition-colors p-1.5 hover:bg-blue-500/10 rounded"
                        >
                          <FaEdit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={(e) => deletePolicy(policy.id, e)}
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
                  <td colSpan="8" className="px-6 py-20 text-center">
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

        {/* Pagination Controls */}
        {totalResults > 0 && (
          <div className="border-t border-white/5 bg-black/30 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Showing X-Y of Z */}
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                Showing <span className="text-slate-300 font-bold">{startIndex + 1}</span>-<span className="text-slate-300 font-bold">{endIndex}</span> of <span className="text-slate-300 font-bold">{totalResults}</span> results
              </p>

              <div className="flex items-center gap-4">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Rows</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="bg-white/5 border border-white/10 text-slate-300 text-[10px] font-mono px-2 py-1 rounded focus:outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={safeCurrentPage <= 1}
                    className="p-1.5 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-slate-400 font-mono text-[10px] uppercase tracking-widest px-3">
                    Page <span className="text-white font-bold">{safeCurrentPage}</span> / <span className="text-slate-500">{totalPages}</span>
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={safeCurrentPage >= totalPages}
                    className="p-1.5 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Policies;
