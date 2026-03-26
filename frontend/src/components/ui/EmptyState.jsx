import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, message, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {Icon && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
          <Icon className="w-10 h-10 text-slate-500" />
        </div>
      )}
      <h3 className="text-lg font-bold text-white font-mono">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-md">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
