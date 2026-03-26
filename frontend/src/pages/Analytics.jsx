import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiChartBarSquare, HiShieldExclamation, HiArrowTrendingUp,
  HiExclamationTriangle, HiLightBulb, HiHeart, HiArrowDownTray,
  HiSignal
} from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import api from '../services/api';
import RiskGauge from '../components/ui/RiskGauge';
import DateRangePicker from '../components/ui/DateRangePicker';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [riskScores, setRiskScores] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trends, setTrends] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predDays, setPredDays] = useState(90);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, riskRes, predRes, anomRes, recRes, trendRes, healthRes] = await Promise.all([
          api.get('/analytics/dashboard').catch(() => ({ data: null })),
          api.get('/analytics/risk-scores').catch(() => ({ data: [] })),
          api.get(`/analytics/predictions?days=${predDays}`).catch(() => ({ data: null })),
          api.get('/analytics/anomalies').catch(() => ({ data: [] })),
          api.get('/analytics/recommendations').catch(() => ({ data: [] })),
          api.get('/analytics/trends').catch(() => ({ data: null })),
          api.get('/analytics/health').catch(() => ({ data: null })),
        ]);
        setDashboard(dashRes.data);
        setRiskScores(Array.isArray(riskRes.data) ? riskRes.data : riskRes.data?.policies || []);
        setPredictions(predRes.data);
        setAnomalies(Array.isArray(anomRes.data) ? anomRes.data : anomRes.data?.anomalies || []);
        setRecommendations(Array.isArray(recRes.data) ? recRes.data : recRes.data?.recommendations || []);
        setTrends(trendRes.data);
        setHealth(healthRes.data);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [predDays]);

  const handleExport = async () => {
    try {
      const res = await api.get('/analytics/report?format=csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio_report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: HiChartBarSquare },
    { key: 'risk', label: 'Risk Scores', icon: HiShieldExclamation },
    { key: 'predictions', label: 'Predictions', icon: HiArrowTrendingUp },
    { key: 'health', label: 'Portfolio Health', icon: HiHeart },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
          <p className="text-white font-mono text-sm animate-pulse uppercase tracking-[0.2em]">ANALYZING PORTFOLIO DATA...</p>
        </div>
      </div>
    );
  }

  // Prepare risk distribution data
  const riskDistribution = (() => {
    const dist = { low: 0, medium: 0, high: 0, critical: 0 };
    riskScores.forEach(p => {
      const score = p.risk_score || 0;
      if (score >= 75) dist.critical++;
      else if (score >= 50) dist.high++;
      else if (score >= 25) dist.medium++;
      else dist.low++;
    });
    return Object.entries(dist).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  })();

  const riskBarData = riskScores.slice(0, 20).map(p => ({
    name: p.policy_number || `#${p.id}`,
    risk: p.risk_score || 0
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">ANALYTICS</h1>
          <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest">
            Advanced AI-Powered Portfolio Intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-mono text-xs uppercase tracking-widest transition-all border border-emerald-400/20">
            <HiArrowDownTray className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 w-fit flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded transition-all flex items-center gap-1.5 ${
              activeTab === tab.key ? 'bg-white/10 text-white border border-white/20' : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Stats */}
            {dashboard && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox label="Total Policies" value={dashboard.total_policies || dashboard.totalPolicies || 0} color="blue" />
                <StatBox label="At Risk" value={dashboard.at_risk || dashboard.atRisk || 0} color="red" />
                <StatBox label="Upcoming Renewals" value={dashboard.upcoming_renewals || dashboard.upcomingRenewals || 0} color="amber" />
                <StatBox label="Avg Risk Score" value={dashboard.avg_risk_score || dashboard.avgRiskScore || 0} color="purple" />
              </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Distribution Pie */}
              <div className="glass-card p-6 tech-border">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <HiShieldExclamation className="w-5 h-5 text-amber-400" /> RISK DISTRIBUTION
                </h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskDistribution} cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {riskDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Scores Bar */}
              <div className="glass-card p-6 tech-border">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <HiChartBarSquare className="w-5 h-5 text-blue-400" /> TOP POLICY RISK SCORES
                </h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskBarData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} />
                      <Bar dataKey="risk" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Anomalies & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6 tech-border">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <HiExclamationTriangle className="w-5 h-5 text-red-400" /> ANOMALIES DETECTED
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {anomalies.length > 0 ? anomalies.map((a, i) => (
                    <div key={i} className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-red-400 uppercase">{a.type || a.policy_number || 'Anomaly'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{a.severity || 'HIGH'}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{a.description || a.reason || JSON.stringify(a)}</p>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-500 font-mono text-xs uppercase">No anomalies detected</div>
                  )}
                </div>
              </div>

              <div className="glass-card p-6 tech-border">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <HiLightBulb className="w-5 h-5 text-amber-400" /> AI RECOMMENDATIONS
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {recommendations.length > 0 ? recommendations.map((r, i) => (
                    <div key={i} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-400 uppercase">{r.title || r.type || `Recommendation ${i + 1}`}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{r.priority || r.impact || ''}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{r.description || r.action || r.message || JSON.stringify(r)}</p>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-500 font-mono text-xs uppercase">No recommendations at this time</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Risk Scores Tab */}
        {activeTab === 'risk' && (
          <motion.div key="risk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card tech-border overflow-hidden">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Policy</th>
                    <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Risk Score</th>
                    <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Risk Level</th>
                    <th className="px-6 py-4 text-left text-[10px] font-mono text-slate-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-black/20">
                  {riskScores.map((p, i) => (
                    <motion.tr
                      key={p.id || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-3 text-xs text-white font-mono font-bold">{p.policy_number || `#${p.id}`}</td>
                      <td className="px-6 py-3 text-xs text-slate-300 font-mono">{p.customer_name || p.Customer?.name || 'N/A'}</td>
                      <td className="px-6 py-3 text-xs text-slate-400 font-mono">{p.type}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${
                              (p.risk_score || 0) >= 75 ? 'bg-red-500' :
                              (p.risk_score || 0) >= 50 ? 'bg-amber-500' :
                              (p.risk_score || 0) >= 25 ? 'bg-blue-500' : 'bg-emerald-500'
                            }`} style={{ width: `${p.risk_score || 0}%` }} />
                          </div>
                          <span className="text-xs font-mono font-bold text-white">{p.risk_score || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-widest ${
                          (p.risk_score || 0) >= 75 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          (p.risk_score || 0) >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          (p.risk_score || 0) >= 25 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {p.risk_level || ((p.risk_score || 0) >= 75 ? 'Critical' : (p.risk_score || 0) >= 50 ? 'High' : (p.risk_score || 0) >= 25 ? 'Medium' : 'Low')}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-400 font-mono">{p.status}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <motion.div key="predictions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 font-mono uppercase">Forecast Window:</span>
              <div className="flex gap-2">
                {[30, 60, 90, 180].map(d => (
                  <button
                    key={d}
                    onClick={() => setPredDays(d)}
                    className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                      predDays === d ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'text-slate-500 border-white/10 hover:text-white'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            {predictions && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox label="Predicted Renewals" value={predictions.total_predicted || predictions.count || 0} color="blue" />
                <StatBox label="Predicted Lapses" value={predictions.predicted_lapses || predictions.lapses || 0} color="red" />
                <StatBox label="Confidence" value={`${predictions.confidence || predictions.avg_confidence || 0}%`} color="green" />
              </div>
            )}

            {predictions?.policies && predictions.policies.length > 0 && (
              <div className="glass-card p-6 tech-border">
                <h3 className="text-white font-bold mb-4">PREDICTED RENEWAL OUTCOMES</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={predictions.policies.slice(0, 30).map(p => ({
                      name: p.policy_number || `#${p.id}`,
                      likelihood: p.renewal_likelihood || p.confidence || 50
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }} angle={-45} textAnchor="end" height={60} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} />
                      <Area type="monotone" dataKey="likelihood" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Portfolio Health Tab */}
        {activeTab === 'health' && health && (
          <motion.div key="health" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 tech-border flex flex-col items-center">
                <RiskGauge score={100 - (health.overall_health || health.health_score || 50)} size={180} label="Portfolio Risk" />
              </div>
              <div className="md:col-span-2 glass-card p-6 tech-border">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <HiHeart className="w-5 h-5 text-red-400" /> HEALTH METRICS
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(health).filter(([k]) => !['policies', 'details'].includes(k)).slice(0, 8).map(([key, val]) => (
                    <div key={key} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{key.replace(/_/g, ' ')}</p>
                      <p className="text-lg font-bold text-white font-mono mt-1">
                        {typeof val === 'number' ? (val % 1 !== 0 ? val.toFixed(1) : val) : String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {trends && (
              <div className="glass-card p-6 tech-border">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <HiArrowTrendingUp className="w-5 h-5 text-emerald-400" /> TREND ANALYSIS
                </h3>
                {trends.monthly && trends.monthly.length > 0 && (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trends.monthly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }} />
                        <Line type="monotone" dataKey="renewals" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                        <Line type="monotone" dataKey="lapses" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {(!trends.monthly || trends.monthly.length === 0) && (
                  <div className="text-center py-12 text-slate-500 font-mono text-xs uppercase">Trend data will appear as more data accumulates</div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const StatBox = ({ label, value, color }) => {
  const colors = {
    blue: 'border-l-blue-500/40 text-blue-400',
    red: 'border-l-red-500/40 text-red-400',
    amber: 'border-l-amber-500/40 text-amber-400',
    green: 'border-l-emerald-500/40 text-emerald-400',
    purple: 'border-l-purple-500/40 text-purple-400',
  };
  return (
    <div className={`glass-card p-4 tech-border border-l-2 ${colors[color]}`}>
      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold font-mono mt-1 ${colors[color]?.split(' ')[1] || 'text-white'}`}>{value}</p>
    </div>
  );
};

export default Analytics;
