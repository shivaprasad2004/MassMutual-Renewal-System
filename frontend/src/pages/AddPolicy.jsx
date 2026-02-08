import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AddPolicy = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    policy_number: '',
    customer_id: '',
    type: 'Life',
    premium_amount: '',
    coverage_amount: '',
    issue_date: '',
    renewal_date: '',
    payment_frequency: 'annually'
  });

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
      }
    };
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/policies', formData, {
        headers: { 'x-auth-token': token }
      });
      navigate('/policies');
    } catch (error) {
      console.error('Error creating policy:', error);
      alert('Error creating policy');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <button 
        onClick={() => navigate('/policies')} 
        className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <FaArrowLeft className="mr-2" /> Back to Policies
      </button>

      <div className="glass-card p-8 rounded-xl">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700/50 pb-4">Create New Policy</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Policy Number</label>
              <input
                type="text"
                name="policy_number"
                value={formData.policy_number}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. POL-2024-001"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Customer</label>
              <select
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Policy Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Life" className="bg-slate-900">Life Insurance</option>
                  <option value="Health" className="bg-slate-900">Health Insurance</option>
                  <option value="Disability" className="bg-slate-900">Disability Insurance</option>
                  <option value="Home" className="bg-slate-900">Home Insurance</option>
                  <option value="Auto" className="bg-slate-900">Auto Insurance</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Payment Frequency</label>
                <select
                  name="payment_frequency"
                  value={formData.payment_frequency}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="monthly" className="bg-slate-900">Monthly</option>
                  <option value="quarterly" className="bg-slate-900">Quarterly</option>
                  <option value="annually" className="bg-slate-900">Annually</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Premium Amount ($)</label>
                <input
                  type="number"
                  name="premium_amount"
                  value={formData.premium_amount}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Coverage Amount ($)</label>
                <input
                  type="number"
                  name="coverage_amount"
                  value={formData.coverage_amount}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Issue Date</label>
                <input
                  type="date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Renewal Date</label>
                <input
                  type="date"
                  name="renewal_date"
                  value={formData.renewal_date}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
               <button
                type="button"
                onClick={() => navigate('/policies')}
                className="px-6 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-2 rounded-lg hover:from-blue-500 hover:to-blue-600 shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all"
              >
                Create Policy
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddPolicy;
