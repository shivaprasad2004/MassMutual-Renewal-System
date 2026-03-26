import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RiskBadge from './RiskBadge';

const KanbanBoard = ({ columns, onMoveCard }) => {
  const [dragItem, setDragItem] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const colConfig = {
    upcoming: { label: 'UPCOMING', color: 'border-blue-500/40', bg: 'bg-blue-500/5', count: 'text-blue-400' },
    in_progress: { label: 'IN PROGRESS', color: 'border-amber-500/40', bg: 'bg-amber-500/5', count: 'text-amber-400' },
    completed: { label: 'COMPLETED', color: 'border-emerald-500/40', bg: 'bg-emerald-500/5', count: 'text-emerald-400' },
    lapsed: { label: 'LAPSED', color: 'border-red-500/40', bg: 'bg-red-500/5', count: 'text-red-400' },
  };

  const handleDragStart = (e, item, fromCol) => {
    setDragItem({ ...item, fromCol });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colKey);
  };

  const handleDrop = (e, toCol) => {
    e.preventDefault();
    if (dragItem && dragItem.fromCol !== toCol) {
      onMoveCard(dragItem.id, dragItem.fromCol, toCol);
    }
    setDragItem(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDragItem(null);
    setDragOverCol(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(columns).map(([colKey, items]) => {
        const conf = colConfig[colKey] || colConfig.upcoming;
        const isOver = dragOverCol === colKey;

        return (
          <div
            key={colKey}
            onDragOver={(e) => handleDragOver(e, colKey)}
            onDrop={(e) => handleDrop(e, colKey)}
            onDragLeave={() => setDragOverCol(null)}
            className={`rounded-xl border ${conf.color} ${conf.bg} p-3 min-h-[300px] transition-all ${
              isOver ? 'ring-2 ring-white/20 bg-white/5' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-slate-300">{conf.label}</span>
              <span className={`text-xs font-mono font-bold ${conf.count}`}>{items.length}</span>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item, colKey)}
                    onDragEnd={handleDragEnd}
                    className="glass-card p-3 cursor-grab active:cursor-grabbing hover:border-white/20"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-white">{item.policy?.policy_number}</span>
                      <RiskBadge level={item.risk_level} score={item.risk_score} />
                    </div>
                    <p className="text-[11px] text-slate-400">{item.policy?.customer_name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-500 font-mono">{item.policy?.type}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.renewal_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-slate-500">
                      ${parseFloat(item.policy?.premium_amount || 0).toLocaleString()}/yr
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
