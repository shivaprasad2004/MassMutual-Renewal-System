import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiArrowLeft, HiDocumentText, HiUser, HiClock, HiCurrencyDollar,
  HiShieldCheck, HiExclamationTriangle, HiArrowPath, HiPencil
} from 'react-icons/hi2';
import api from '../services/api';
import RiskGauge from '../components/ui/RiskGauge';
import RiskBadge from '../components/ui/RiskBadge';
import Timeline from '../components/ui/Timeline';

const PolicyDetail = () => {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);
  const [risk, setRisk] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [policyRes, riskRes, timelineRes] = await Promise.all([
          api.get(`/policies/${id}`),
          api.get(`/policies/${id}/risk-breakdown`).catch(() => ({ data: null })),
          api.get(`/policies/${id}/timeline`).catch(() => ({ data: { timeline: [] } }))
        ]);
        setPolicy(policyRes.data);
        setRisk(riskRes.data);
        setTimeline(timelineRes.data.timeline || []);
      } catch (err) {
        console.error('Error loading policy:', err);
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
          <p className="text-white font-mono text-sm animate-pulse uppercase tracking-[0.2em]">LOADING POLICY DATA...</p>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <HiExclamationTriangle className="w-16 h-16 text-red-400" />
        <p className="text-white font-mono text-lg">POLICY NOT FOUND</p>
        <Link to="/policies" className="text-blue-400 font-mono text-sm hover:underline">Return to Policies</Link>
      </div>
    );
  }

  const statusColor = {
    'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Lapsed': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Renewed': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Pending Renewal': 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'risk', label: 'Risk Analysis' },
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
          <Link to="/policies" className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <HiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">{policy.policy_number}</h1>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-widest ${statusColor[policy.status] || statusColor['Active']}`}>
                {policy.status}
              </span>
            </div>
            <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest">
              {policy.type} • Customer: {policy.Customer?.name || 'N/A'}
            </p>
          </div>
        </div>
        <Link to={`/policies/edit/${policy.id}`} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-xs uppercase tracking-widest transition-all border border-blue-400/20">
          <HiPencil className="w-4 h-4" /> Edit
        </Link>
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

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Policy Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 tech-border">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <HiDocumentText className="w-5 h-5 text-blue-400" /> POLICY DETAILS
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Policy Number" value={policy.policy_number} />
                <InfoRow label="Type" value={policy.type} />
                <InfoRow label="Status" value={policy.status} />
                <InfoRow label="Payment Frequency" value={policy.payment_frequency} />
                <InfoRow label="Issue Date" value={policy.issue_date} />
                <InfoRow label="Renewal Date" value={policy.renewal_date} />
                <InfoRow label="Premium Amount" value={`₹${parseFloat(policy.premium_amount || 0).toLocaleString('en-IN')}`} />
                <InfoRow label="Coverage Amount" value={`₹${parseFloat(policy.coverage_amount || 0).toLocaleString('en-IN')}`} />
              </div>
            </div>

            {/* Customer Info */}
            {policy.Customer && (
              <div className="glass-card p-6 tech-border">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <HiUser className="w-5 h-5 text-amber-400" /> CUSTOMER PROFILE
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Name" value={policy.Customer.name} />
                  <InfoRow label="Email" value={policy.Customer.email} />
                  <InfoRow label="Phone" value={policy.Customer.phone || 'N/A'} />
                  <InfoRow label="Customer ID" value={`#${policy.Customer.id}`} />
                </div>
                <Link to={`/customers/${policy.Customer.id}`} className="mt-4 inline-flex items-center gap-2 text-blue-400 font-mono text-xs hover:underline uppercase tracking-wider">
                  View Full Profile <HiArrowPath className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Risk Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 tech-border flex flex-col items-center">
              <RiskGauge score={risk?.total_score || 0} size={160} label="Overall Risk" />
              {risk && (
                <div className="mt-4 w-full">
                  <RiskBadge level={risk.risk_level} score={risk.total_score} showScore size="lg" />
                </div>
              )}
            </div>

            <div className="glass-card p-6 tech-border">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <HiClock className="w-5 h-5 text-purple-400" /> KEY DATES
              </h3>
              <div className="space-y-3">
                <DateItem label="Issued" date={policy.issue_date} />
                <DateItem label="Next Renewal" date={policy.renewal_date} highlight />
                <DateItem label="Created" date={policy.createdAt} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risk' && risk && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 tech-border flex flex-col items-center">
              <RiskGauge score={risk.total_score} size={200} label="Composite Risk Score" />
            </div>
            <div className="glass-card p-6 tech-border">
              <h3 className="text-white font-bold mb-4">RISK FACTORS</h3>
              <div className="space-y-4">
                {risk.factors?.map((factor, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-slate-300 uppercase">{factor.name}</span>
                      <span className="text-xs font-mono text-white">{factor.score}/{factor.max}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(factor.score / factor.max) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.15 }}
                        className={`h-full rounded-full ${
                          factor.score / factor.max >= 0.7 ? 'bg-red-500' :
                          factor.score / factor.max >= 0.4 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {risk.recommendation && (
            <div className="glass-card p-6 tech-border border-l-2 border-l-amber-500/50">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <HiShieldCheck className="w-5 h-5 text-amber-400" /> AI RECOMMENDATION
              </h3>
              <p className="text-slate-300 text-sm font-mono">{risk.recommendation}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'risk' && !risk && (
        <div className="glass-card p-12 tech-border text-center">
          <HiExclamationTriangle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 font-mono text-sm">Risk analysis data unavailable</p>
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

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{label}</p>
    <p className="text-sm text-white font-mono mt-0.5">{value}</p>
  </div>
);

const DateItem = ({ label, date, highlight }) => (
  <div className={`flex items-center justify-between p-2 rounded ${highlight ? 'bg-amber-500/5 border border-amber-500/20' : 'border border-white/5'}`}>
    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{label}</span>
    <span className={`text-xs font-mono ${highlight ? 'text-amber-400 font-bold' : 'text-white'}`}>
      {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
    </span>
  </div>
);

export default PolicyDetail;
