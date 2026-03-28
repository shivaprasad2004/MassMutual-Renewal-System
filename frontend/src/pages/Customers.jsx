import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaUserCircle, FaEnvelope, FaPhone } from 'react-icons/fa';
import { HiMagnifyingGlass, HiChevronUpDown } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredCustomers = customers
    .filter(c => {
      const search = searchTerm.toLowerCase();
      return (
        c.name?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.phone?.includes(search)
      );
    })
    .sort((a, b) => {
      let aVal = a[sortConfig.key] || '';
      let bVal = b[sortConfig.key] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <div className="space-y-6">
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/10 pb-6 mb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Customers</h1>
          <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest">View and manage customer details</p>
        </div>
        <div className="relative group flex-1 max-w-sm">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search customers..."
            className="bg-white/5 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded font-mono text-xs focus:outline-none focus:border-blue-500/50 w-full placeholder-slate-600 transition-all focus:ring-1 focus:ring-blue-500/20 uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card tech-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-white/5">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    Name <HiChevronUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    Contact Info <HiChevronUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/20">
              <AnimatePresence>
                {filteredCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-white/5 transition-colors group border-l-2 border-transparent hover:border-blue-500/50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/customers/${customer.id}`} className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-full flex items-center justify-center text-blue-400 font-mono font-bold text-sm border border-blue-500/20">
                          {customer.name?.[0] || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{customer.name}</div>
                          <div className="text-[10px] text-slate-600 font-mono">ID: #{customer.id}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-slate-300 flex items-center mb-1">
                        <FaEnvelope className="mr-2 text-slate-500 w-3 h-3" /> {customer.email}
                      </div>
                      <div className="text-xs text-slate-300 flex items-center">
                        <FaPhone className="mr-2 text-slate-500 w-3 h-3" /> {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Active
                       </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                      <HiMagnifyingGlass className="text-4xl" />
                      <p className="font-mono text-xs uppercase tracking-[0.3em]">No customers found</p>
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

export default Customers;
