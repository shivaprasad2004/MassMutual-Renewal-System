import { useState } from 'react';

const DateRangePicker = ({ onChange, className = '' }) => {
  const [range, setRange] = useState('30d');

  const ranges = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' },
  ];

  const handleChange = (value) => {
    setRange(value);
    if (onChange) onChange(value);
  };

  return (
    <div className={`flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/10 ${className}`}>
      {ranges.map((r) => (
        <button
          key={r.value}
          onClick={() => handleChange(r.value)}
          className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider transition-all ${
            range === r.value
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-slate-500 hover:text-slate-300 border border-transparent'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
};

export default DateRangePicker;
