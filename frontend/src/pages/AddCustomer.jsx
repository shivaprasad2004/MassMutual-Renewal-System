import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return toast.error('Name and Email are required');
    }

    setIsSubmitting(true);
    try {
      await api.post('/customers', formData);
      toast.success('Customer added successfully!');
      navigate('/customers');
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error(error.response?.data?.message || 'Error adding customer');
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all uppercase text-xs font-mono";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <button
        onClick={() => navigate('/customers')}
        className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors font-mono text-xs uppercase tracking-widest"
      >
        <FaArrowLeft className="mr-2" /> Back to Customers
      </button>

      <div className="glass-card p-8 tech-border">
        <h2 className="text-2xl font-black text-white mb-6 uppercase italic tracking-tighter flex items-center gap-3">
          <FaUserPlus className="text-blue-500" /> Register New Customer
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Enter customer name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClasses}
                placeholder="customer@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-2">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputClasses}
                placeholder="e.g. +91 9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-2">Physical Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`${inputClasses} h-24 resize-none`}
              placeholder="Enter customer address"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-8 py-3 rounded font-mono text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Customer'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddCustomer;
