import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle, actions, icon: Icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Icon className="w-6 h-6 text-amber-400" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-white font-mono tracking-wide uppercase">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 font-mono mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
};

export default PageHeader;
