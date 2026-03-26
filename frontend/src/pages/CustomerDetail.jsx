import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiArrowLeft, HiUser, HiEnvelope, HiPhone, HiDocumentText,
  HiShieldExclamation, HiCurrencyDollar, HiClock
} from 'react-icons/hi2';
import api from '../services/api';
import RiskGauge from '../components/ui/RiskGauge';
import RiskBadge from '../components/ui/RiskBadge';
import Timeline from '../components/ui/Timeline';

const CustomerDetail = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, timelineRes] = await Promise.all([
          api.get(`/customers/${id}`),
          api.get(`/customers/${id}/timeline`).catch(() => ({ data: [] }))
        ]);
        setProfile(profileRes.data);
        setTimeline(timelineRes.data || []);
      } catch (err) {
        console.error('Error loading customer:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
          <p className="text-white font-mono text-sm animate-pulse uppercase tracking-[0.2em]">LOADING CUSTOMER PROFILE...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <HiUser className="w-16 h-16 text-red-400" />
        <p className="text-white font-mono text-lg">CUSTOMER NOT FOUND</p>
        <Link to="/customers" className="text-blue-400 font-mono text-sm hover:underline">Return to Customers</Link>
      </div>
    );
  }

  const customer = profile.customer || profile;
  const policies = profile.policies || [];
  const riskScore = profile.risk_assessment?.overall_risk || profile.avg_risk || 0;
  const riskLevel = profile.risk_assessment?.risk_level || profile.risk_level || 'low';

  const statusColor = {
    'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Lapsed': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Renewed': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Pending Renewal': 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'policies', label: `Policies (${policies.length})` },
    { key: 'timeline', label: 'Timeline' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <Link to="/customers" className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <HiArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center text-amber-400 font-mono font-bold text-xl border border-amber-500/30">
              {customer.name?.[0] || 'C'}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">{customer.name}</h1>
              <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest">
                ID: #{customer.id} • {policies.length} Policies
              </p>
            </div>
          </div>
        </div>
        <RiskBadge level={riskLevel} score={riskScore} showScore size="lg" />
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded transition-all ${
              activeTab === tab.key ? 'bg-white/10 text-white border border-white/20' : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <div className="glass-card p-6 tech-border">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <HiUser className="w-5 h-5 text-blue-400" /> CONTACT INFORMATION
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <HiEnvelope className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-mono uppercase">Email</p>
                    <p className="text-sm text-white font-mono">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <HiPhone className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-mono uppercase">Phone</p>
                    <p className="text-sm text-white font-mono">{customer.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-4 tech-border text-center">
                <HiDocumentText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white font-mono">{policies.length}</p>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Policies</p>
              </div>
              <div className="glass-card p-4 tech-border text-center">
                <HiCurrencyDollar className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white font-mono">
                  ${policies.reduce((sum, p) => sum + (parseFloat(p.premium_amount) || 0), 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Total Premium</p>
              </div>
              <div className="glass-card p-4 tech-border text-center">
                <HiShieldExclamation className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white font-mono">{riskScore}</p>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Risk Score</p>
              </div>
            </div>
          </div>

          {/* Risk Gauge */}
          <div className="space-y-6">
            <div className="glass-card p-6 tech-border flex flex-col items-center">
              <RiskGauge score={riskScore} size={160} label="Customer Risk" />
            </div>
            {profile.risk_assessment?.factors && (
              <div className="glass-card p-6 tech-border">
                <h3 className="text-white font-bold mb-3 text-sm">RISK FACTORS</h3>
                {profile.risk_assessment.factors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-slate-400 font-mono">{f.name || f}</span>
                    {f.impact && <span className={`text-[10px] font-mono ${f.impact === 'high' ? 'text-red-400' : 'text-amber-400'}`}>{f.impact.toUpperCase()}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="glass-card tech-border overflow-hidden">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Policy ID</th>
                <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Premium</th>
                <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Renewal Date</th>
                <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/20">
              {policies.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link to={`/policies/${p.id}`} className="text-xs text-blue-400 font-mono font-bold hover:underline">
                      {p.policy_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300 font-mono">{p.type}</td>
                  <td className="px-6 py-4 text-xs text-white font-mono">${parseFloat(p.premium_amount || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs text-slate-300 font-mono">{p.renewal_date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-widest ${statusColor[p.status] || statusColor['Active']}`}>
                      {p.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {policies.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">
                    No policies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="glass-card p-6 tech-border">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <HiClock className="w-5 h-5 text-purple-400" /> ACTIVITY TIMELINE
          </h3>
          <Timeline items={timeline} />
        </div>
      )}
    </motion.div>
  );
};

export default CustomerDetail;
