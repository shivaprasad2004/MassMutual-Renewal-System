import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import { HiDocumentText, HiCurrencyDollar, HiClipboardDocumentCheck } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, label: 'Policy Info', icon: HiDocumentText },
  { id: 2, label: 'Financial Details', icon: HiCurrencyDollar },
  { id: 3, label: 'Review & Submit', icon: HiClipboardDocumentCheck },
];

const AddPolicy = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        const res = await api.get('/customers');
        setCustomers(res.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.policy_number.trim()) newErrors.policy_number = 'Policy number is required';
      if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
      if (!formData.type) newErrors.type = 'Policy type is required';
    } else if (step === 2) {
      if (!formData.premium_amount || parseFloat(formData.premium_amount) <= 0) newErrors.premium_amount = 'Valid premium amount is required';
      if (!formData.coverage_amount || parseFloat(formData.coverage_amount) <= 0) newErrors.coverage_amount = 'Valid coverage amount is required';
      if (!formData.issue_date) newErrors.issue_date = 'Issue date is required';
      if (!formData.renewal_date) newErrors.renewal_date = 'Renewal date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/policies', formData);
      toast.success('Policy created successfully!');
      navigate('/policies');
    } catch (error) {
      console.error('Error creating policy:', error);
      toast.error(error.response?.data?.message || 'Error creating policy');
      setIsSubmitting(false);
    }
  };

  const getCustomerName = () => {
    const c = customers.find(c => String(c.id) === String(formData.customer_id));
    return c?.name || 'N/A';
  };

  const inputClasses = (field) => `w-full bg-slate-900/50 border ${
    errors[field] ? 'border-red-500/50' : 'border-slate-700'
  } text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all focus:shadow-[0_0_15px_rgba(59,130,246,0.15)]`;

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

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                currentStep > step.id
                  ? 'bg-green-500 border-green-500 text-white'
                  : currentStep === step.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-transparent border-slate-700 text-slate-500'
              }`}>
                {currentStep > step.id ? (
                  <FaCheck className="w-4 h-4" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className={`mt-2 text-[10px] font-mono uppercase tracking-wider ${
                currentStep >= step.id ? 'text-white' : 'text-slate-600'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 mt-[-1.5rem] ${
                currentStep > step.id ? 'bg-green-500' : 'bg-slate-700'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="glass-card p-8 rounded-xl">
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* Step 1: Policy Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-white border-b border-slate-700/50 pb-4">Policy Information</h2>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Policy Number</label>
                  <input
                    type="text"
                    name="policy_number"
                    value={formData.policy_number}
                    onChange={handleChange}
                    className={inputClasses('policy_number')}
                    placeholder="e.g. POL-2024-001"
                  />
                  {errors.policy_number && <p className="text-red-400 text-xs mt-1">{errors.policy_number}</p>}
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Customer</label>
                  <select
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleChange}
                    className={inputClasses('customer_id')}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                  {errors.customer_id && <p className="text-red-400 text-xs mt-1">{errors.customer_id}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Policy Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className={inputClasses('type')}
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
                      className={inputClasses('payment_frequency')}
                    >
                      <option value="monthly" className="bg-slate-900">Monthly</option>
                      <option value="quarterly" className="bg-slate-900">Quarterly</option>
                      <option value="annually" className="bg-slate-900">Annually</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Financial Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-white border-b border-slate-700/50 pb-4">Financial Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Premium Amount (₹)</label>
                    <input
                      type="number"
                      name="premium_amount"
                      value={formData.premium_amount}
                      onChange={handleChange}
                      className={inputClasses('premium_amount')}
                      placeholder="e.g. 50000"
                    />
                    {errors.premium_amount && <p className="text-red-400 text-xs mt-1">{errors.premium_amount}</p>}
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Coverage Amount (₹)</label>
                    <input
                      type="number"
                      name="coverage_amount"
                      value={formData.coverage_amount}
                      onChange={handleChange}
                      className={inputClasses('coverage_amount')}
                      placeholder="e.g. 1000000"
                    />
                    {errors.coverage_amount && <p className="text-red-400 text-xs mt-1">{errors.coverage_amount}</p>}
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
                      className={inputClasses('issue_date')}
                    />
                    {errors.issue_date && <p className="text-red-400 text-xs mt-1">{errors.issue_date}</p>}
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Renewal Date</label>
                    <input
                      type="date"
                      name="renewal_date"
                      value={formData.renewal_date}
                      onChange={handleChange}
                      className={inputClasses('renewal_date')}
                    />
                    {errors.renewal_date && <p className="text-red-400 text-xs mt-1">{errors.renewal_date}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-white border-b border-slate-700/50 pb-4">Review & Submit</h2>

                <div className="glass-panel p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Policy Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <ReviewField label="Policy Number" value={formData.policy_number} />
                    <ReviewField label="Customer" value={getCustomerName()} />
                    <ReviewField label="Type" value={formData.type} />
                    <ReviewField label="Frequency" value={formData.payment_frequency} />
                    <ReviewField label="Premium" value={`₹${parseFloat(formData.premium_amount || 0).toLocaleString()}`} />
                    <ReviewField label="Coverage" value={`₹${parseFloat(formData.coverage_amount || 0).toLocaleString()}`} />
                    <ReviewField label="Issue Date" value={formData.issue_date} />
                    <ReviewField label="Renewal Date" value={formData.renewal_date} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={currentStep === 1 ? () => navigate('/policies') : prevStep}
              className="px-6 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-mono text-xs uppercase tracking-wider"
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-2.5 rounded-lg hover:from-blue-500 hover:to-blue-600 shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all font-mono text-xs uppercase tracking-wider"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-2.5 rounded-lg hover:from-green-500 hover:to-green-600 shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5 transition-all font-mono text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Policy'}
              </button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const ReviewField = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{label}</p>
    <p className="text-white font-medium">{value || '—'}</p>
  </div>
);

export default AddPolicy;
