import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserCircle, FaEnvelope, FaPhone, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/customers', {
          headers: { 'x-auth-token': token }
        });
        setCustomers(res.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Customers</h1>
        <p className="text-slate-400 text-sm mt-1">View and manage customer details</p>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-700/50">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Info</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            <AnimatePresence>
              {customers.map((customer, index) => (
                <motion.tr 
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                        <FaUserCircle className="text-2xl" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{customer.name}</div>
                        <div className="text-sm text-slate-500">ID: #{customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-300 flex items-center mb-1">
                      <FaEnvelope className="mr-2 text-slate-500" /> {customer.email}
                    </div>
                    <div className="text-sm text-slate-300 flex items-center">
                      <FaPhone className="mr-2 text-slate-500" /> {customer.phone}
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
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Customers;
