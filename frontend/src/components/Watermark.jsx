import React from 'react';
import { motion } from 'framer-motion';
import { HiShieldCheck } from 'react-icons/hi2';

const Watermark = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Diagonal text pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 200px,
            rgba(255,255,255,0.015) 200px,
            rgba(255,255,255,0.015) 200.5px
          )`,
        }}
      >
        <div className="absolute inset-[-100%] flex flex-wrap gap-32 rotate-[-45deg] opacity-[0.03]">
          {[...Array(40)].map((_, i) => (
            <span
              key={i}
              className="text-white font-mono text-sm tracking-[0.5em] whitespace-nowrap select-none"
            >
              MASSMUTUAL
            </span>
          ))}
        </div>
      </div>

      {/* Floating shield logos */}
      {[
        { x: '10%', y: '20%', size: 32, duration: 20, delay: 0 },
        { x: '80%', y: '15%', size: 28, duration: 25, delay: 3 },
        { x: '60%', y: '70%', size: 36, duration: 22, delay: 5 },
        { x: '25%', y: '80%', size: 24, duration: 28, delay: 8 },
        { x: '90%', y: '50%', size: 30, duration: 18, delay: 2 },
        { x: '45%', y: '40%', size: 26, duration: 24, delay: 10 },
      ].map((item, i) => (
        <motion.div
          key={i}
          className="absolute opacity-[0.025]"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -20, 0, 20, 0],
            x: [0, 10, 0, -10, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: item.delay,
          }}
        >
          <HiShieldCheck style={{ width: item.size, height: item.size }} className="text-white" />
        </motion.div>
      ))}
    </div>
  );
};

export default Watermark;
