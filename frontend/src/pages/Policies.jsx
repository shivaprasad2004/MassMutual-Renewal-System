import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

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
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white">Policies</h1>
           <p className="text-massmutual-text-muted text-sm">Manage all insurance policies</p>
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <FaSearch className="absolute left-3 top-3 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search policies..."
              className="bg-massmutual-card border border-massmutual-border text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-full placeholder-zinc-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link
            to="/policies/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-all shadow-glow hover:shadow-glow-strong"
          >
            <FaPlus className="mr-2" /> Add Policy
          </Link>
        </div>
      </div>

      <div className="bg-massmutual-card rounded-xl border border-massmutual-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-massmutual-border">
            <thead className="bg-black/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Policy #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Renewal Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-massmutual-border">
              {filteredPolicies.map((policy) => (
                <tr key={policy.id} className="hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium group-hover:text-blue-400 transition-colors">{policy.policy_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{policy.Customer?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{policy.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{policy.renewal_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                      policy.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                      policy.status === 'Lapsed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {policy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-400 hover:text-blue-300 mr-4 transition-colors"><FaEdit /></button>
                    <button onClick={() => deletePolicy(policy.id)} className="text-zinc-500 hover:text-red-400 transition-colors"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Policies;
