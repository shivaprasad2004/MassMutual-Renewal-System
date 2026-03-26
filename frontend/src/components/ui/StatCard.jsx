import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendUp, color = 'blue', sparkline = [] }) => {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30 text-red-400',
    green: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
  };

  const maxVal = Math.max(...sparkline, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 bg-gradient-to-br ${colors[color]} border relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-mono">{title}</p>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-mono ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              <span>{trendUp ? '+' : ''}{trend}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg bg-white/5`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {sparkline.length > 0 && (
        <div className="flex items-end gap-[2px] h-8 mt-3">
          {sparkline.map((val, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-white/20 min-h-[2px]"
              style={{ height: `${(val / maxVal) * 100}%` }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
