import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar 
} from 'recharts';
import { motion } from 'framer-motion';
import api from '../services/api';
import { 
  HiCpuChip as CpuChipIcon, 
  HiExclamationTriangle as ExclamationIcon, 
  HiLightBulb as LightBulbIcon,
  HiArrowTrendingUp as TrendingUpIcon,
  HiShieldCheck as ShieldCheckIcon
} from 'react-icons/hi2';

const AIInsights = () => {
  const [data, setData] = useState({ 
    predictions: [], 
    anomalies: [], 
    trends: [], 
    recommendations: [],
    health: { score: 0, grade: 'N/A', status: 'unknown', breakdown: {} } 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        const res = await api.get('/policies/ai-insights');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching AI insights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAIInsights();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 tech-border border-l-blue-500/50 border-l-4"
        >
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">PORTFOLIO HEALTH</p>
          <div className="flex items-end justify-between mt-2">
            <h4 className="text-3xl font-black text-white italic">{data.health?.grade}</h4>
            <span className="text-xs font-mono text-blue-400">{data.health?.score}%</span>
          </div>
          <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${data.health?.score || 0}%` }}
               className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
             />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 tech-border border-l-emerald-500/50 border-l-4"
        >
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">AVG RETENTION</p>
          <div className="flex items-end justify-between mt-2">
            <h4 className="text-3xl font-black text-white italic">
               {data.trends.length > 0 ? (data.trends.reduce((a, b) => a + b.retentionRate, 0) / data.trends.length).toFixed(0) : 0}%
            </h4>
            <TrendingUpIcon className="w-5 h-5 text-emerald-500 mb-1" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 tech-border border-l-amber-500/50 border-l-4"
        >
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">PREDICTED LAPSES</p>
          <div className="flex items-end justify-between mt-2">
            <h4 className="text-3xl font-black text-white italic">
               {data.predictions.filter(p => p.prediction === 'at_risk').length}
            </h4>
            <ExclamationIcon className="w-5 h-5 text-amber-500 mb-1" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 tech-border border-l-red-500/50 border-l-4"
        >
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">ANOMALIES</p>
          <div className="flex items-end justify-between mt-2">
            <h4 className="text-3xl font-black text-white italic">{data.anomalies.length}</h4>
            <SignalIcon className="w-5 h-5 text-red-500 mb-1" />
          </div>
        </motion.div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 tech-border"
        >
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5 text-green-400" />
            RENEWAL PERFORMANCE TRENDS
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trends}>
                <defs>
                  <linearGradient id="colorRenewed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="renewed" stroke="#10b981" fillOpacity={1} fill="url(#colorRenewed)" strokeWidth={2} />
                <Area type="monotone" dataKey="lapsed" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Prediction Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 tech-border"
        >
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
            RENEWAL PROBABILITY ANALYSIS
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.predictions.slice(0, 5)}>
                <XAxis dataKey="policy_number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="renewal_probability" radius={[4, 4, 0, 0]}>
                  {data.predictions.slice(0, 5).map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.renewal_probability > 70 ? '#10b981' : entry.renewal_probability > 40 ? '#fbbf24' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* AI Recommendations & Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2 px-2">
            <LightBulbIcon className="w-5 h-5 text-yellow-400" />
            SMART RECOMMENDATIONS
          </h3>
          <div className="space-y-3">
            {data.predictions.filter(p => p.prediction === 'at_risk').map((p, i) => (
              <motion.div 
                key={i}
                whileHover={{ x: 5 }}
                className="glass-card p-4 border-l-4 border-amber-500 flex items-start gap-4"
              >
                <div className="bg-amber-500/10 p-2 rounded">
                  <ExclamationIcon className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{p.policy_number}</span>
                    <span className="text-amber-500 text-[10px] font-mono px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded">AT RISK</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{p.recommended_action}</p>
                </div>
              </motion.div>
            ))}
            {data.predictions.length === 0 && (
               <div className="text-slate-500 font-mono text-xs p-8 text-center border border-dashed border-slate-800 rounded">
                 NO AT-RISK POLICIES DETECTED IN THE NEXT 90 DAYS
               </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2 px-2">
            <ExclamationIcon className="w-5 h-5 text-red-500" />
            ANOMALY LOGS
          </h3>
          <div className="space-y-3">
            {data.anomalies.map((a, i) => (
              <div key={i} className="glass-card p-4 border border-red-500/20 bg-red-500/5">
                <p className="text-red-400 font-bold text-xs uppercase tracking-wider">{a.type}</p>
                <p className="text-slate-300 text-xs mt-1 leading-relaxed">{a.message}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">ID: {a.policy_number}</span>
                </div>
              </div>
            ))}
            {data.anomalies.length === 0 && (
               <div className="text-slate-500 font-mono text-xs p-8 text-center border border-dashed border-slate-800 rounded">
                 NO DATA ANOMALIES DETECTED
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
