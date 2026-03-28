import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiShieldCheck, HiBell, HiChartBar } from 'react-icons/hi2';

const useCounter = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
};

const HeroDashboardMockup = () => {
  const policies = useCounter(1247);
  const revenue = useCounter(48291);
  const riskScore = useCounter(94);
  const [telemetryLines, setTelemetryLines] = useState([]);

  useEffect(() => {
    const messages = [
      '> SYSTEM_INIT: Policy engine online',
      '> SCAN: 1,247 active policies loaded',
      '> AI_RISK: Computing risk matrices...',
      '> SYNC: ServiceNow connected',
      '> ALERT: 3 renewals due this week',
      '> TELEMETRY: All systems operational',
      '> MONITOR: Real-time tracking active',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      setTelemetryLines(prev => [...prev.slice(-4), messages[idx % messages.length]]);
      idx++;
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const barData = [65, 80, 45, 90, 70, 55, 85];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="glass-card p-6 border border-white/10 relative overflow-hidden h-full"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiShieldCheck className="text-blue-500 w-4 h-4" />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Live Dashboard</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-mono text-green-400">LIVE</span>
        </div>
      </div>

      {/* Stat counters */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <p className="text-[8px] font-mono text-slate-500 uppercase">Active Policies</p>
          <p className="text-lg font-black text-white font-mono">{policies.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <p className="text-[8px] font-mono text-slate-500 uppercase">Revenue</p>
          <p className="text-lg font-black text-amber-400 font-mono">${(revenue / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <p className="text-[8px] font-mono text-slate-500 uppercase">Risk Score</p>
          <p className="text-lg font-black text-green-400 font-mono">{riskScore}%</p>
        </div>
      </div>

      {/* Mini bar chart */}
      <div className="mb-4">
        <div className="flex items-center gap-1 mb-2">
          <HiChartBar className="w-3 h-3 text-slate-500" />
          <span className="text-[8px] font-mono text-slate-500 uppercase">Monthly Premiums</span>
        </div>
        <div className="flex items-end gap-1 h-16">
          {barData.map((value, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: `${value}%` }}
              transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
            />
          ))}
        </div>
      </div>

      {/* Telemetry stream */}
      <div className="bg-black/60 rounded border border-white/5 p-2 h-24 overflow-hidden font-mono text-[9px]">
        {telemetryLines.map((line, i) => (
          <motion.p
            key={`${i}-${line}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-green-400/70 leading-relaxed"
          >
            {line}
          </motion.p>
        ))}
      </div>

      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute top-4 right-4"
      >
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-2 flex items-center gap-2">
          <HiBell className="w-3 h-3 text-blue-400" />
          <span className="text-[8px] text-blue-300 font-mono">3 new alerts</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HeroDashboardMockup;
