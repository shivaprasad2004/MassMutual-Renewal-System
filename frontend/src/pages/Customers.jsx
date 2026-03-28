import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaUsers,
  FaShieldAlt,
  FaDollarSign,
  FaClipboardList,
} from 'react-icons/fa';
import {
  HiMagnifyingGlass,
  HiChevronUpDown,
  HiPlus,
  HiChevronLeft,
  HiChevronRight,
  HiTableCells,
  HiSquares2X2,
  HiExclamationTriangle,
  HiShieldCheck,
} from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCounter from '../components/ui/AnimatedCounter';

// --- Helpers ---

const getRiskConfig = (riskLevel, avgRisk) => {
  const score = avgRisk ?? 0;
  if (riskLevel === 'critical' || score >= 75) {
    return { label: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', bar: 'bg-red-500', glow: 'shadow-red-500/20' };
  }
  if (riskLevel === 'high' || score >= 50) {
    return { label: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', bar: 'bg-orange-500', glow: 'shadow-orange-500/20' };
  }
  if (riskLevel === 'medium' || score >= 25) {
    return { label: 'MEDIUM', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', bar: 'bg-blue-500', glow: 'shadow-blue-500/20' };
  }
  return { label: 'LOW', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bar: 'bg-emerald-500', glow: 'shadow-emerald-500/20' };
};

const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// --- Component ---

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/customers');
        setCustomers(res.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // --- Sort handler ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- Filtered + sorted list ---
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const search = searchTerm.toLowerCase();
        return (
          c.name?.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search) ||
          c.phone?.includes(search)
        );
      })
      .sort((a, b) => {
        let aVal = a[sortConfig.key] ?? '';
        let bVal = b[sortConfig.key] ?? '';
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [customers, searchTerm, sortConfig]);

  // --- Summary stats ---
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalPolicies = customers.reduce((sum, c) => sum + (c.policy_count || 0), 0);
    const avgRisk =
      totalCustomers > 0
        ? customers.reduce((sum, c) => sum + (parseFloat(c.avg_risk) || 0), 0) / totalCustomers
        : 0;
    const totalPremium = customers.reduce((sum, c) => sum + (parseFloat(c.total_premium) || 0), 0);
    return { totalCustomers, totalPolicies, avgRisk, totalPremium };
  }, [customers]);

  // --- Pagination ---
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCustomers = filteredCustomers.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );
  const showingFrom = filteredCustomers.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(safePage * pageSize, filteredCustomers.length);

  // Reset page on search/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig, pageSize]);

  // --- Loading skeleton ---
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card tech-border p-5">
              <div className="h-3 w-20 bg-white/5 rounded shimmer mb-3" />
              <div className="h-8 w-24 bg-white/5 rounded shimmer" />
            </div>
          ))}
        </div>
        <div className="h-8 w-48 bg-white/5 rounded shimmer" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-white/5 rounded shimmer" />
                <div className="h-3 w-48 bg-white/5 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Stat card data ---
  const statCards = [
    {
      label: 'Total Customers',
      value: stats.totalCustomers,
      format: 'number',
      icon: FaUsers,
      borderColor: 'border-l-blue-500/50',
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      accentColor: 'text-blue-400',
    },
    {
      label: 'Total Policies',
      value: stats.totalPolicies,
      format: 'number',
      icon: FaClipboardList,
      borderColor: 'border-l-amber-500/50',
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      accentColor: 'text-amber-400',
    },
    {
      label: 'Average Risk Score',
      value: stats.avgRisk,
      format: 'decimal',
      icon: FaShieldAlt,
      borderColor: 'border-l-orange-500/50',
      iconBg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      accentColor: 'text-orange-400',
    },
    {
      label: 'Total Premium Revenue',
      value: stats.totalPremium,
      format: 'currency',
      icon: FaDollarSign,
      borderColor: 'border-l-emerald-500/50',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      accentColor: 'text-emerald-400',
    },
  ];

  // --- Table header columns ---
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Contact', sortable: true },
    { key: 'policy_count', label: 'Policies', sortable: true },
    { key: 'avg_risk', label: 'Risk Level', sortable: true },
    { key: 'total_premium', label: 'Premium', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-10"
    >
      {/* ========== HEADER ========== */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            Customers
          </h1>
          <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
            <HiShieldCheck className="w-4 h-4 text-emerald-500" />
            Customer intelligence &bull; portfolio analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative group flex-1 min-w-[200px] max-w-sm">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search customers..."
              className="bg-white/5 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded font-mono text-xs focus:outline-none focus:border-blue-500/50 w-full placeholder-slate-600 transition-all focus:ring-1 focus:ring-blue-500/20 uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-white/5 p-1 rounded border border-white/10">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
              title="List View"
            >
              <HiTableCells className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${
                viewMode === 'grid'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
              title="Grid View"
            >
              <HiSquares2X2 className="w-4 h-4" />
            </button>
          </div>

          {/* Add Customer Button */}
          <button
            onClick={() => navigate('/customers/new')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded font-mono text-xs uppercase tracking-widest flex items-center hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95 border border-blue-400/20"
          >
            <HiPlus className="mr-2 w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>

      {/* ========== STAT CARDS ROW ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            className={`glass-card tech-border p-5 border-l-2 ${card.borderColor} relative group overflow-hidden`}
          >
            <div className="absolute -right-3 -top-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <card.icon className="w-20 h-20" />
            </div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mb-2">
                  {card.label}
                </p>
                <h3 className="text-3xl font-black text-white font-mono">
                  {card.format === 'currency' ? (
                    <AnimatedCounter
                      target={card.value}
                      prefix="$"
                      format="currency"
                      decimals={0}
                    />
                  ) : card.format === 'decimal' ? (
                    <AnimatedCounter
                      target={card.value}
                      format="percentage"
                      decimals={1}
                      suffix="%"
                    />
                  ) : (
                    <AnimatedCounter target={card.value} />
                  )}
                </h3>
              </div>
              <div
                className={`p-2.5 rounded border ${card.iconBg} group-hover:scale-110 transition-transform`}
              >
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ========== LIST VIEW ========== */}
      {viewMode === 'list' && (
        <motion.div
          key="list-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card tech-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-white/5">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                      className={`px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest transition-colors group ${
                        col.sortable ? 'cursor-pointer hover:text-white' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && (
                          <HiChevronUpDown
                            className={`w-3 h-3 transition-opacity ${
                              sortConfig.key === col.key
                                ? 'opacity-100 text-blue-400'
                                : 'opacity-0 group-hover:opacity-100'
                            }`}
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-black/20">
                <AnimatePresence>
                  {paginatedCustomers.map((customer, index) => {
                    const risk = getRiskConfig(customer.risk_level, customer.avg_risk);
                    return (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => navigate(`/customers/${customer.id}`)}
                        className="hover:bg-white/5 transition-colors group border-l-2 border-transparent hover:border-blue-500/50 cursor-pointer"
                      >
                        {/* Name + Avatar */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-full flex items-center justify-center text-blue-400 font-mono font-bold text-sm border border-blue-500/20">
                              {customer.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                {customer.name}
                              </div>
                              <div className="text-[10px] text-slate-600 font-mono">
                                ID: #{customer.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-slate-300 flex items-center mb-1">
                            <FaEnvelope className="mr-2 text-slate-500 w-3 h-3" />
                            {customer.email || 'N/A'}
                          </div>
                          <div className="text-xs text-slate-300 flex items-center">
                            <FaPhone className="mr-2 text-slate-500 w-3 h-3" />
                            {customer.phone || 'N/A'}
                          </div>
                        </td>

                        {/* Policies */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 inline-flex text-xs font-bold rounded bg-white/5 text-white border border-white/10 font-mono">
                            {customer.policy_count || 0}
                          </span>
                        </td>

                        {/* Risk Level */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 inline-flex text-[9px] font-black rounded border uppercase tracking-widest ${risk.bg} ${risk.color} ${risk.border}`}
                            >
                              {risk.label}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-10 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${Math.min(parseFloat(customer.avg_risk) || 0, 100)}%`,
                                  }}
                                  transition={{ duration: 1, delay: index * 0.03 }}
                                  className={`h-full rounded-full ${risk.bar}`}
                                />
                              </div>
                              <span className={`text-[10px] font-mono font-bold ${risk.color}`}>
                                {parseFloat(customer.avg_risk)?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Premium */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-emerald-400 font-mono">
                            {formatCurrency(customer.total_premium)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 inline-flex text-[9px] leading-5 font-black rounded border uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            Active
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>

                {/* Empty state */}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                        <HiMagnifyingGlass className="text-4xl" />
                        <p className="font-mono text-xs uppercase tracking-[0.3em]">
                          No customers found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ========== PAGINATION ========== */}
          {filteredCustomers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Rows per page
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 text-slate-300 text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-blue-500/50 cursor-pointer uppercase"
                >
                  {[10, 25, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Showing {showingFrom}-{showingTo} of {filteredCustomers.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="p-2 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-white/10"
                >
                  <HiChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 5) return true;
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - safePage) <= 1) return true;
                    return false;
                  })
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) {
                      acc.push('...');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="px-2 text-slate-600 font-mono text-xs"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded font-mono text-xs transition-all border ${
                          safePage === p
                            ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="p-2 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-white/10"
                >
                  <HiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ========== GRID VIEW ========== */}
      {viewMode === 'grid' && (
        <motion.div
          key="grid-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {paginatedCustomers.map((customer, index) => {
                const risk = getRiskConfig(customer.risk_level, customer.avg_risk);
                return (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className={`glass-card tech-border p-5 cursor-pointer group border-l-2 ${
                      risk.border
                    } hover:border-l-blue-500/50 relative overflow-hidden`}
                  >
                    {/* Risk indicator dot */}
                    <div
                      className={`absolute top-3 right-3 w-2 h-2 rounded-full ${risk.bar} animate-pulse`}
                    />

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-full flex items-center justify-center text-blue-400 font-mono font-bold text-lg border border-blue-500/20 group-hover:border-blue-400/40 transition-colors">
                        {customer.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                          {customer.name}
                        </div>
                        <div className="text-[10px] text-slate-600 font-mono">
                          ID: #{customer.id}
                        </div>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[11px] text-slate-400 flex items-center truncate">
                        <FaEnvelope className="mr-2 text-slate-600 w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{customer.email || 'N/A'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center">
                        <FaPhone className="mr-2 text-slate-600 w-3 h-3 flex-shrink-0" />
                        {customer.phone || 'N/A'}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                      <div>
                        <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                          Policies
                        </p>
                        <p className="text-sm font-bold text-white font-mono">
                          {customer.policy_count || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                          Risk
                        </p>
                        <p className={`text-sm font-bold font-mono ${risk.color}`}>
                          {parseFloat(customer.avg_risk)?.toFixed(0) || '0'}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                          Premium
                        </p>
                        <p className="text-sm font-bold text-emerald-400 font-mono">
                          {formatCurrency(customer.total_premium)}
                        </p>
                      </div>
                    </div>

                    {/* Risk badge */}
                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 inline-flex text-[8px] font-black rounded border uppercase tracking-widest ${risk.bg} ${risk.color} ${risk.border}`}
                      >
                        {risk.label}
                      </span>
                      <span className="px-2 py-0.5 inline-flex text-[8px] font-black rounded border uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Active
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty state for grid */}
          {filteredCustomers.length === 0 && (
            <div className="glass-card tech-border px-6 py-20 text-center">
              <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                <HiMagnifyingGlass className="text-4xl" />
                <p className="font-mono text-xs uppercase tracking-[0.3em]">
                  No customers found
                </p>
              </div>
            </div>
          )}

          {/* Grid view pagination */}
          {filteredCustomers.length > 0 && (
            <div className="glass-card tech-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Per page
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="bg-white/5 border border-white/10 text-slate-300 text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-blue-500/50 cursor-pointer uppercase"
                  >
                    {[10, 25, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Showing {showingFrom}-{showingTo} of {filteredCustomers.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="p-2 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-white/10"
                  >
                    <HiChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (totalPages <= 5) return true;
                      if (p === 1 || p === totalPages) return true;
                      if (Math.abs(p - safePage) <= 1) return true;
                      return false;
                    })
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) {
                        acc.push('...');
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="px-2 text-slate-600 font-mono text-xs"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`w-8 h-8 rounded font-mono text-xs transition-all border ${
                            safePage === p
                              ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                              : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="p-2 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-white/10"
                  >
                    <HiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Customers;
