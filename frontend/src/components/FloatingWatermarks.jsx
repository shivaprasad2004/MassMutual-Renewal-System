import React, { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HiShieldCheck } from 'react-icons/hi2';

const FloatingWatermarks = () => {
  const { scrollY } = useScroll();
  const parallax1 = useTransform(scrollY, [0, 1000], [0, -50]);
  const parallax2 = useTransform(scrollY, [0, 1000], [0, -30]);
  const parallax3 = useTransform(scrollY, [0, 1000], [0, -70]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const items = useMemo(() => {
    const base = [
      { type: 'mm', x: '8%', y: '15%', size: 40, duration: 22, delay: 0, parallax: parallax1 },
      { type: 'shield', x: '85%', y: '10%', size: 34, duration: 26, delay: 2, parallax: parallax2 },
      { type: 'mm', x: '70%', y: '60%', size: 36, duration: 20, delay: 4, parallax: parallax3 },
      { type: 'shield', x: '15%', y: '75%', size: 30, duration: 24, delay: 6, parallax: parallax1 },
      { type: 'mm', x: '50%', y: '35%', size: 28, duration: 28, delay: 8, parallax: parallax2 },
      { type: 'shield', x: '92%', y: '80%', size: 32, duration: 18, delay: 1, parallax: parallax3 },
      { type: 'mm', x: '35%', y: '90%', size: 38, duration: 21, delay: 5, parallax: parallax1 },
      { type: 'shield', x: '60%', y: '5%', size: 26, duration: 30, delay: 10, parallax: parallax2 },
    ];
    return isMobile ? base.slice(0, 4) : base;
  }, [isMobile, parallax1, parallax2, parallax3]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute opacity-[0.025]"
          style={{
            left: item.x,
            top: item.y,
            y: item.parallax,
          }}
          animate={{
            y: [0, -15, 0, 15, 0],
            x: [0, 8, 0, -8, 0],
            rotate: [0, 3, 0, -3, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: item.delay,
          }}
        >
          {item.type === 'shield' ? (
            <HiShieldCheck style={{ width: item.size, height: item.size }} className="text-white" />
          ) : (
            <span
              className="text-white font-mono font-black select-none"
              style={{ fontSize: item.size * 0.6 }}
            >
              MM
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingWatermarks;
