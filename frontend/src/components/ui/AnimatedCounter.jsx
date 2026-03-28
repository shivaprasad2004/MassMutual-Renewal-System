import { useState, useEffect, useRef } from 'react';

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const AnimatedCounter = ({ target, duration = 1500, format = 'number', prefix = '', suffix = '', decimals = 0 }) => {
  const [display, setDisplay] = useState('0');
  const animRef = useRef(null);
  const hasAnimated = useRef(false);
  const elementRef = useRef(null);

  useEffect(() => {
    if (hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [target]);

  const startAnimation = () => {
    const startTime = performance.now();
    const numTarget = parseFloat(target) || 0;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = eased * numTarget;

      setDisplay(formatValue(current));

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(formatValue(numTarget));
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const formatValue = (value) => {
    switch (format) {
      case 'currency':
        return value.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      case 'percentage':
        return value.toFixed(decimals);
      default:
        return Math.floor(value).toLocaleString();
    }
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <span ref={elementRef}>
      {prefix}{display}{suffix}
    </span>
  );
};

export default AnimatedCounter;
