import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMagnifyingGlass, HiDocumentText, HiUsers, HiCpuChip, HiXMark } from 'react-icons/hi2';
import api from '../services/api';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ policies: [], customers: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults({ policies: [], customers: [] });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ policies: [], customers: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [policiesRes, customersRes] = await Promise.all([
          api.get(`/policies?search=${encodeURIComponent(query)}&limit=5`).catch(() => ({ data: { policies: [] } })),
          api.get('/customers').catch(() => ({ data: [] }))
        ]);
        const policies = policiesRes.data?.policies || policiesRes.data || [];
        const allCustomers = Array.isArray(customersRes.data) ? customersRes.data : [];
        const customers = allCustomers.filter(c =>
          c.name?.toLowerCase().includes(query.toLowerCase()) ||
          c.email?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        setResults({ policies, customers });
        setSelectedIndex(0);
      } catch {
        // silent
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const allResults = [
    ...results.policies.map(p => ({ type: 'policy', label: p.policy_number, sub: `${p.type} - ${p.status}`, path: `/policies/${p.id}` })),
    ...results.customers.map(c => ({ type: 'customer', label: c.name, sub: c.email, path: `/customers/${c.id}` })),
  ];

  const quickActions = [
    { label: 'AI Command Center', icon: HiCpuChip, path: '/ai-command' },
    { label: 'View All Policies', icon: HiDocumentText, path: '/policies' },
    { label: 'View All Customers', icon: HiUsers, path: '/customers' },
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, (allResults.length || quickActions.length) - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query && allResults[selectedIndex]) {
        navigate(allResults[selectedIndex].path);
        onClose();
      } else if (!query && quickActions[selectedIndex]) {
        navigate(quickActions[selectedIndex].path);
        onClose();
      }
    }
  };

  const getIcon = (type) => {
    if (type === 'policy') return HiDocumentText;
    if (type === 'customer') return HiUsers;
    return HiCpuChip;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg glass-panel border border-white/20 shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <HiMagnifyingGlass className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search policies, customers, or type a command..."
              className="flex-1 bg-transparent text-white text-sm font-mono outline-none placeholder-slate-500"
            />
            <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-400">
              <HiXMark className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-slate-500 text-xs font-mono">Searching...</div>
            )}

            {!loading && query && allResults.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-xs font-mono">No results found for "{query}"</div>
            )}

            {!loading && query && allResults.length > 0 && (
              <div className="p-2">
                {allResults.map((result, i) => {
                  const Icon = getIcon(result.type);
                  return (
                    <button
                      key={`${result.type}-${i}`}
                      onClick={() => { navigate(result.path); onClose(); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedIndex === i ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono font-bold truncate">{result.label}</p>
                        <p className="text-[10px] text-slate-500 truncate">{result.sub}</p>
                      </div>
                      <span className="text-[9px] text-slate-600 font-mono uppercase">{result.type}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && !query && (
              <div className="p-2">
                <p className="px-3 py-1.5 text-[9px] font-mono text-slate-600 tracking-wider">QUICK ACTIONS</p>
                {quickActions.map((action, i) => (
                  <button
                    key={action.path}
                    onClick={() => { navigate(action.path); onClose(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedIndex === i ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <action.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-mono">{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-[9px] font-mono text-slate-600">
            <span>ESC to close</span>
            <span>ENTER to select</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalSearch;
