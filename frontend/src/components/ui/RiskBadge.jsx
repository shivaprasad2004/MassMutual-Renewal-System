const RiskBadge = ({ level, score, showScore = false, size = 'sm' }) => {
  const config = {
    critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', label: 'CRITICAL' },
    high: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', label: 'HIGH' },
    medium: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/40', label: 'MEDIUM' },
    low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', label: 'LOW' },
  };

  const c = config[level] || config.low;
  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-xs' : 'px-2 py-0.5 text-[10px]';

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} rounded font-mono font-bold tracking-wider ${c.bg} ${c.text} border ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.bg} ${c.text} animate-pulse`} style={{ backgroundColor: 'currentColor' }} />
      {c.label}
      {showScore && score !== undefined && <span className="opacity-70">({score})</span>}
    </span>
  );
};

export default RiskBadge;
