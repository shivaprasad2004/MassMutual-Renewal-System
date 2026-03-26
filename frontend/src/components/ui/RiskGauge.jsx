import { motion } from 'framer-motion';

const RiskGauge = ({ score = 0, size = 120, label = 'Risk Score' }) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;

  const getColor = (s) => {
    if (s >= 75) return '#ef4444';
    if (s >= 50) return '#f59e0b';
    if (s >= 25) return '#3b82f6';
    return '#10b981';
  };

  const getGrade = (s) => {
    if (s >= 75) return 'CRITICAL';
    if (s >= 50) return 'HIGH';
    if (s >= 25) return 'MEDIUM';
    return 'LOW';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx={center} cy={center} r={radius}
            fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono text-white">{score}</span>
          <span className="text-[9px] font-mono tracking-wider" style={{ color }}>{getGrade(score)}</span>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-2">{label}</p>
    </div>
  );
};

export default RiskGauge;
