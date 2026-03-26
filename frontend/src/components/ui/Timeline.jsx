import { motion } from 'framer-motion';

const Timeline = ({ items = [] }) => {
  const getActionColor = (action) => {
    if (action?.includes('created')) return 'bg-emerald-500';
    if (action?.includes('updated')) return 'bg-amber-500';
    if (action?.includes('deleted')) return 'bg-red-500';
    if (action?.includes('alert') || action?.includes('ai')) return 'bg-purple-500';
    return 'bg-blue-500';
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 font-mono text-sm">
        No activity recorded yet
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10" />
      {items.map((item, i) => (
        <motion.div
          key={item.id || i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="relative mb-4 last:mb-0"
        >
          <div className={`absolute left-[-17px] top-1.5 w-3 h-3 rounded-full ${getActionColor(item.action)} border-2 border-black`} />
          <div className="glass-card p-3 ml-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase">{item.action?.replace(/_/g, ' ')}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Timeline;
