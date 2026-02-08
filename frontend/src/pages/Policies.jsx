import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/policies', {
        headers: { 'x-auth-token': token }
      });
      setPolicies(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching policies:', error);
      setLoading(false);
    }
  };

  const deletePolicy = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/policies/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  const filteredPolicies = policies.filter(policy => 
    policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.Customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Policies</h1>
           <p className="text-slate-400 text-sm mt-1">Manage all insurance policies</p>
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none group">
            <FaSearch className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search policies..."
              className="bg-slate-900/50 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-full placeholder-slate-600 transition-all focus:ring-1 focus:ring-blue-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link
            to="/policies/new"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg flex items-center hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
          >
            <FaPlus className="mr-2" /> Add Policy
          </Link>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700/50">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Policy #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Renewal Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              <AnimatePresence>
                {filteredPolicies.map((policy, index) => (
                  <motion.tr 
                    key={policy.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium group-hover:text-blue-400 transition-colors">{policy.policy_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{policy.Customer?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{policy.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{policy.renewal_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                        policy.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        policy.status === 'Lapsed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-400 hover:text-blue-300 mr-4 transition-colors p-2 hover:bg-blue-500/10 rounded-lg"><FaEdit /></button>
                      <button onClick={() => deletePolicy(policy.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"><FaTrash /></button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Policies;
