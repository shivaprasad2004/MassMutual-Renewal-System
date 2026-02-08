import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const TelemetryStream = () => {
  const [logs, setLogs] = useState([]);
  const scrollRef = useRef(null);

  const generateLog = () => {
    const systems = ['POLICY_CORE', 'RISK_ENGINE', 'TRANSACTION_LAYER', 'COMPLIANCE_NODE', 'USER_AUTH'];
    const actions = ['SCANNING', 'PROCESSING', 'VERIFYING', 'ENCRYPTING', 'SYNCING'];
    const statuses = ['NOMINAL', 'ACTIVE', 'OPTIMAL', 'SECURE'];
    
    const timestamp = new Date().toISOString();
    const system = systems[Math.floor(Math.random() * systems.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      system,
      message: `${action} DATA STREAM [${Math.floor(Math.random() * 9999)}] >> LATENCY: ${Math.floor(Math.random() * 20)}ms`,
      status: statuses[Math.floor(Math.random() * statuses.length)]
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = generateLog();
        const newLogs = [...prev, newLog];
        if (newLogs.length > 20) newLogs.shift();
        return newLogs;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="font-mono text-xs h-full flex flex-col bg-black/60 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-sm">
      <div className="bg-black/80 p-2 border-b border-slate-800 flex justify-between items-center">
        <span className="text-white font-bold tracking-wider">LIVE TELEMETRY</span>
        <div className="flex space-x-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-slate-500">ONLINE</span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
      >
        {logs.map((log) => (
          <motion.div 
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="border-l-2 border-slate-700 pl-3 py-1 hover:bg-white/5 transition-colors"
          >
            <div className="flex space-x-3 text-slate-500 mb-1">
              <span>{log.timestamp}</span>
              <span className="text-slate-400">[{log.system}]</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>{log.message}</span>
              <span className="text-green-500/80">{log.status}</span>
            </div>
            
            {/* Shift5-style raw data block (occasional) */}
            {Math.random() > 0.7 && (
              <div className="mt-1 text-[10px] text-slate-600 leading-tight">
                BLOCK: {Math.random().toString(16).toUpperCase().substr(2, 12)} | 
                HASH: {Math.random().toString(16).toUpperCase().substr(2, 8)} | 
                Q: {Math.floor(Math.random() * 100)}%
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TelemetryStream;
